(function () {
  'use strict';

  angular
  .module('cmd.home')
  .controller('LecturerDashboardController', LecturerDashboardController);

  /** @ngInject */
  function LecturerDashboardController(
    $scope,
    Global,
    World,
    TrelloApi,
    LECTURER_ACCESS_LEVEL
  ) {

    if(Global.getAccess() < LECTURER_ACCESS_LEVEL) {
      return Global.notAllowed();
    }

    Global.setRouteTitle('Dashboard');
    Global.setRouteBackRoute(null);

    var self = this;

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Method Declarations
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    self.getWorld = getWorld;
    self.gotoCard = gotoCard;

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Variables
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    self.user = Global.getUser();
    self.worlds = [];
    self.loading_page = false;

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Broadcasts
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    $scope.$on('world-changed', function(event, world) {
      self.selected_world = world;
      if(!_.findWhere(self.worlds, { id: world })) {
        self.getWorld(world);
      }
    });

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Services
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Extra logic
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    if(Global.getSelectedWorld()) {
      self.selected_world = Global.getSelectedWorld();
      self.getWorld(Global.getSelectedWorld());
    }

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Methods
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    function gotoCard(card) {
        window.open(card.shortUrl);
    }

    function getWorld(world) {
      self.loading_page = true;
      World.getWorld(world)
      .then(function(response) {
        self.loading_page = false;
        self.worlds.push(response);
        if(!response.course_duration || !response.start) {
          response.not_configured = true;
          return false;
        }
        var current_week = response.course_duration - Math.floor(moment.duration(moment(response.start).add(response.course_duration, 'weeks') - moment()).asWeeks());
        _.each(response.guilds, function(guild) {

          // Feedback
          _.each(guild.members, function(member) {
            member.user_id = member.user.id;
            member.endorsed_complete = 0;
          });
          _.each(guild.rules, function(rule){
            _.each(rule.endorsements, function(endorsement) {
              // Current week - 1 because we save week 1 as week 0 (etc.) in the DB
              if(endorsement.week == (current_week - 1)) {
                if(_.findWhere(guild.members, {user_id: endorsement.endorsed_by})) {
                  _.findWhere(guild.members, {user_id: endorsement.endorsed_by}).endorsed_complete++;
                }
              }
            });
          });
          _.each(guild.members, function(member) {
            member.endorsed_complete = member.endorsed_complete * 100 / (guild.rules.length * (guild.members.length - 1)); // Substract yo-self
          });

          // Cards due
          if(!guild.trello_board || !guild.trello_done_list) {
              guild.trello_not_configured = true;
              return false;
          }

          guild.cards_overdue = [];

          if(!guild.trello_not_configured) {
            TrelloApi.Authenticate()
            .then(function() {

              TrelloApi.Rest('GET', 'boards/' + guild.trello_board)
              .then(function(response) {
                TrelloApi.Rest('GET', 'boards/' + guild.trello_board + '/cards' )
                .then(function(response) {
                  _.each(response, function(card) {
                    if(card.due && moment(card.due).isBefore(moment()) && card.idList != guild.trello_done_list) {
                      guild.cards_overdue.push(card);
                    }
                  });
                })
                .catch(function(error) {
                  console.log(error);
                });
              })
              .catch(function(error) {
                console.log(error);
              });
            })
            .catch(function(error) {
              console.log(error);
            });
          }
        });
      })
      .catch(function(error) {
        console.log(error);
      });
    }


  }
}());
