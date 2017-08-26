(function () {
    'use strict';

    angular
        .module('cmd.guilds')
        .controller('GuildSettingsController', GuildSettingsController);

    /** @ngInject */
    function GuildSettingsController(
        $mdDialog,
        $mdToast,
        $state,
        $stateParams,
        Global,
        Notifications,
        Guild,
        TrelloApi,
        LECTURER_ACCESS_LEVEL,
        TRELLO_USER_ID
    ) {

        if(Global.getAccess() < LECTURER_ACCESS_LEVEL) {
            return Global.notAllowed();
        }

        Global.setRouteTitle('Team settings');
        Global.setRouteBackRoute('base.guilds.overview');

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.deleteGuild = deleteGuild;
        self.changeGuildName = changeGuildName;
        self.patchSettings = patchSettings;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.guild = [];
        self.trello_boards = [];
        self.trello_board_lists = [];
        self.loading_page = true;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getGuild($stateParams.guildUuid)
            .then(function(response) {
                if(response.status === 404) {
                    Notifications.simpleToast('Team ' + $stateParams.guildUuid + ' does not exist');
                    $state.go('base.guilds.overview');
                }
                Global.setRouteTitle('Team settings ' + response.name);
                self.guild = response;

                TrelloApi.Authenticate()
                .then(function(response) {
                    TrelloApi.Rest('GET', 'members/' + TRELLO_USER_ID + '/boards')
                    .then(function(response) {
                        self.trello_boards = response;
                    });
                    if(self.guild.trello_board) {
                        TrelloApi.Rest('GET', 'boards/' + self.guild.trello_board + '/lists')
                        .then(function(response) {
                            self.trello_board_lists = response;
                            self.loading_page = false;
                        }, function(error){
                            self.loading_page = false;
                            self.guild.trello_board = null;
                            self.guild.trello_board_lists = null;
                            Guild.patchGuildSettings(self.guild)
                            .then(function(response) {
                                Notifications.simpleToast('Trello board doesn\'t exist anymore, updated guild.');
                            })
                            .catch(function(error) {
                                console.log(error);
                            });
                            // Make sure to delete this setting in the backend
                            // bacause the bord has been deleted
                        });
                    } else {
                      self.loading_page = false;
                    }
                }, function(error){
                    console.log(error);
                });

            }, function() {
                // Err
            });


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function deleteGuild(event) {
            Notifications.confirmation(
                'Are you sure you want to delete this team?',
                'Please consider your answer, this action can not be undone.',
                'Delete team',
                event
            ).then(function() {
                Guild.deleteGuild(self.guild.id)
                .then(function(response) {
                    Notifications.simpleToast('Team ' + self.guild.name + ' has been deleted');
                    $state.go('base.guilds.overview');
                }, function() {
                    // Err deleting guild
                });
            }, function() {
                // Nope Nope Nope Nope
            });
        }

        function changeGuildName(event) {
            Notifications.prompt(
                'Change the team name of "' +self.guild.name+ '"',
                'How would you like to name this team?',
                'Team name',
                event
            )
            .then(function(result) {
                // Checks for thw world name
                if(!result) {
                    return Notifications.simpleToast('Please enter a team name');
                }

                Guild.patchGuildName(result, self.guild.id)
                .then(function(response) {
                    Notifications.simpleToast('Team name change to ' + result);
                    self.guild.name = result;
                }, function() {
                    // Err patch guild name
                });
            }, function() {
                // Cancel
            });
        }

        function patchSettings() {
            if(self.guild.trello_board) {
                TrelloApi.Rest('GET', 'boards/' + self.guild.trello_board + '/lists')
                .then(function(response) {
                    self.trello_board_lists = response;
                }, function(error){
                    console.log(error);
                });
            }

            Guild.patchGuildSettings(self.guild)
            .then(function(response) {
                Notifications.simpleToast('Team settings saved.');
            })
            .catch(function(error) {
                console.log(error);
            });
        }


    }
}());
