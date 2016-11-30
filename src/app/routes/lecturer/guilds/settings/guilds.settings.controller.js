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
            Global.notAllowed();
            return;
        }

        Global.setRouteTitle('Group settings');
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

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getGuild($stateParams.guildUuid)
            .then(function(response) {
                if(response.status === 404) {
                    Notifications.simpleToast('Group ' + $stateParams.guildUuid + ' does not exist');
                    $state.go('base.guilds.overview');
                }
                Global.setRouteTitle('Group settings', response.name);
                self.guild = response;
                console.log(self.guild);

                TrelloApi.Authenticate()
                .then(function(response) {
                    TrelloApi.Rest('GET', 'members/' + TRELLO_USER_ID + '/boards')
                    .then(function(response){
                        self.trello_boards = response;
                    });
                }, function(error){
                    console.log(error);
                });

                if(self.guild.trello_board) {
                    TrelloApi.Rest('GET', 'boards/' + self.guild.trello_board + '/lists')
                    .then(function(response) {
                        self.trello_board_lists = response;
                    }, function(error){
                        console.log(error);
                    });
                }

            }, function() {
                // Err
            });


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function deleteGuild(event) {
            Notifications.confirmation(
                'Are you sure you want to delete this group?',
                'Please consider your answer, this action can not be undone.',
                'Delete group',
                event
            ).then(function() {
                Guild.deleteGuild(self.guild.id)
                .then(function(response) {
                    Notifications.simpleToast('Group ' + self.guild.name + ' has been deleted');
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
                'Change the group name of "' +self.guild.name+ '"',
                'How would you like to name this group?',
                'Group name',
                event
            )
            .then(function(result) {
                // Checks for thw world name
                if(!result) {
                    return Notifications.simpleToast('Please enter a group name');
                }

                Guild.patchGuildName(result, self.guild.id)
                .then(function(response) {
                    Notifications.simpleToast('Group name change to ' + result);
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
                Notifications.simpleToast('Group settings saved.');
            })
            .catch(function(error) {
                console.log(error);
            });
        }


    }
}());
