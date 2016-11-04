(function () {
    'use strict';

    angular
        .module('cmd.home')
        .controller('StudentDashboardController', StudentDashboardController);

    /** @ngInject */
    function StudentDashboardController(
        $rootScope,
        Global,
        Guild,
        TrelloApi,
        localStorageService,
        Notifications,
        STUDENT_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < STUDENT_ACCESS_LEVEL) {
            return Global.notAllowed();
        }

        Global.setRouteTitle('Dashboard');

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.gotoCard = gotoCard;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.selected_guild = Global.getSelectedGuild();
        self.user.trello = null;
        self.guilds = [];
        self.loading_page = true;



        $rootScope.$on('guild-changed', function(event, guild) {
            self.selected_guild = guild;

            if(_.findWhere(self.guilds, {id: self.selected_guild})) {
                Global.setRouteTitle('Dashboard', _.findWhere(self.guilds, {id: self.selected_guild}).name);
            }
        });
        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
             Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getUserGuilds(self.user.id)
        .then(function(response) {
            self.user.guilds = [];
            self.user.trello = localStorageService.get('trello_user');

            if(!self.user.trello) {
                return Notifications.simpleToast('Please authenticate your trello account.');
            }

            _.each(response.guilds, function(guild) {
                self.guilds.push(guild.guild);
            });

            if(_.findWhere(self.guilds, {id: self.selected_guild})) {
                Global.setRouteTitle('Dashboard', _.findWhere(self.guilds, {id: self.selected_guild}).name);
            }

            _.each(self.guilds, function(guild) {
                self.loading_page = true;
                if(!guild.trello_board || !guild.trello_done_list) {
                    return false;
                }

                TrelloApi.Authenticate()
                .then(function() {
                    TrelloApi.Rest('GET', 'boards/' + guild.trello_board + '/cards')
                    .then(function(response) {
                        var cards = _.filter(response, function(card) {
                            // No user assigned -> card is for everybody
                            if(card.idMembers < 1) {
                                return card;
                            } else if(_.contains(card.idMembers, self.user.trello.id)) {
                                return card;
                            }
                        });

                        cards = _.filter(cards, function(card) {
                            return card.idList !== guild.trello_done_list;
                        });
                        guild.todo_list = cards;
                        self.loading_page = false;
                    });
                });

            });
        });
        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
             Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function gotoCard(card) {
            window.open(card.shortUrl);
        }



    }
}());
