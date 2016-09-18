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
        LECTURER_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < LECTURER_ACCESS_LEVEL) {
            Global.notAllowed();
            return;
        }

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.deleteGuild = deleteGuild;
        self.changeGuildName = changeGuildName;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getGuild($stateParams.guildUuid)
            .then(function(response) {
                if(response.status === 404) {
                    Notifications.simpleToast('Group ' + $stateParams.guildUuid + ' does not exist');
                    $state.go('base.guilds.overview');
                }

                self.guild = response;
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

    }

}());
