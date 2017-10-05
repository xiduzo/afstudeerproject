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
    Guild,
    toastr,
    TrelloApi,
    HTTP_STATUS,
    localStorageService,
    LECTURER_ACCESS_LEVEL
  ) {

    if(Global.getAccess() < LECTURER_ACCESS_LEVEL) {
      return Global.notAllowed();
    }

    Global.setRouteTitle('Dashboard');
    Global.setRouteBackRoute(null);

    var vm = this;

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Method Declarations
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    vm.getWorld = getWorld;
    vm.gotoCard = gotoCard;

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Variables
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    vm.user = Global.getUser();
    vm.worlds = [];
    vm.loading_page = false;

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Broadcasts
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    $scope.$on('world-changed', function(event, world) {
      vm.selected_world = world;
      if(!_.findWhere(vm.worlds, { id: world })) {
        vm.getWorld(world);
      }
    });

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Services
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Extra logic
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    if(Global.getSelectedWorld()) {
      vm.selected_world = Global.getSelectedWorld();
      vm.getWorld(Global.getSelectedWorld());
    }

    function getOverdueTrelloCards(guild) {
      TrelloApi.Authenticate()
      .then(function() {

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
    }

    function getGuildRules(guild) {
      var local_guilds = localStorageService.get('guilds') || [];

      if(_.findWhere(local_guilds, {guild: guild.id}) && moment(_.findWhere(local_guilds, {guild: guild.id}).datetime).isAfter(moment().subtract(1, 'minutes'))) {
        guild.rules = _.findWhere(local_guilds, {guild: guild.id}).rules;
        getFeedbackProgression(guild);
      } else {
        Guild.V2getGuildRules(guild.id)
        .then(function(response) {
          local_guilds = localStorageService.get('guilds') || [];
          var local_guild = _.findWhere(local_guilds, {guild: guild.id});
          var tempObj = {
            guild: guild.id,
            datetime: moment(),
            rules: response.data
          };

          // Check if we need to update the local storage
          if(local_guild) {
            local_guilds[_.indexOf(local_guilds, local_guild)] = tempObj;
          } else {
            local_guilds.push(tempObj);
          }

          localStorageService.set('guilds', local_guilds);

          guild.rules = response.data;
          getFeedbackProgression(guild);
        })
        .catch(function(error) {
          toastr.error(error);
        });
      }
    }

    function getFeedbackProgression(guild) {
      var current_week = guild.course_duration - Math.floor(moment.duration(moment(guild.start).add(guild.course_duration, 'weeks') - moment()).asWeeks());

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
        member.endorsed_complete = member.endorsed_complete * 100 / (guild.rules.length * (guild.members.length - 1)); // Substract yo-vm
      });
    }

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Methods
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    function gotoCard(card) {
      window.open(card.shortUrl);
    }

    function getWorld(world) {
      vm.loading_page = true;
      World.V2getWorld(world)
      .then(function(response) {

        // TODO
        // A nice way of letting the user know they have to slow down
        if(response.status === HTTP_STATUS.THROTTLED) {
          return alert(response.data.detail);
        }

        vm.loading_page = false;

        _.each(response.data.guilds, function(guild) {
          // Make sure the world is configured
          if(!response.data.course_duration || !response.data.start) {
            response.data.not_configured = true;
          }

          var world = response.data;

          // Get the relevant guild data
          // Members, trello board and trello done list
          Guild.getGuild(guild.id)
          .then(function(response) {
            _.each(response.members, function(member) {
              member.user_id = member.user.id;
              member.endorsed_complete = 0;
            });

            guild.course_duration = world.course_duration;
            guild.start = world.start;
            guild.members = response.members;
            guild.trello_board = response.trello_board;
            guild.trello_done_list = response.trello_done_list;

            // Make sure trello is configured
            // If so get the overdue cards
            if(!guild.trello_board || !guild.trello_done_list) {
              guild.trello_not_configured = true;
            } else {
              guild.cards_overdue = [];
              getOverdueTrelloCards(guild);
            }

            // Get the guild rules
            getGuildRules(guild);

          })
          .catch(function(error) {
            toastr.error(error);
          });

        });

        vm.worlds.push(response.data);

      })
      .catch(function(error) {
        toastr.error(error);
      });
    }


  }
}());
