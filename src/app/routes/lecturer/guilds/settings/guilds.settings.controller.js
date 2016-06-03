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
        Guild,
        LECTURER_ACCESS_LEVEL
    ) {

        if(Global.getAccess() !== LECTURER_ACCESS_LEVEL) {
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
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Guild ' + $stateParams.guildUuid + ' does not exist')
                        .position('bottom right')
                        .hideDelay(3000)
                    );
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
            var dialog = $mdDialog.confirm()
                        .title('Are you sure you want to delete this guild?')
                        .textContent('Please consider your answer, this action can not be undone.')
                        .clickOutsideToClose(true)
                        .ariaLabel('Delete guil')
                        .targetEvent(event)
                        .ok('Yes, I accept the consequences')
                        .cancel('No, take me back!');

            $mdDialog.show(dialog).then(function() {
                Guild.deleteGuild(self.guild.id)
                    .then(function(response) {
                        $mdToast.show(
                            $mdToast.simple()
                            .textContent('Guild ' + self.guild.name + ' has been deleted')
                            .position('bottom right')
                            .hideDelay(3000)
                        );
                        $state.go('base.guilds.overview');
                    }, function() {
                        // Err
                    });
            }, function() {
                // No
            });
        }

        function changeGuildName(event, guild) {
            var dialog = $mdDialog.prompt()
                        .title('Change the guild name of "' +self.guild.name+ '"')
                        .textContent('How would you like to name this guild?')
                        .clickOutsideToClose(true)
                        .placeholder('Guild name')
                        .ariaLabel('Guild name')
                        .targetEvent(event)
                        .ok('Change guild name')
                        .cancel('Cancel');

            $mdDialog.show(dialog)
                .then(function(result) {
                    // Ok

                    // Checks for thw world name
                    if(!result) {
                        $mdToast.show(
                            $mdToast.simple()
                            .textContent('Please enter a guild name')
                            .position('bottom right')
                            .hideDelay(3000)
                        );
                        return;
                    }

                    Guild.patchGuildName(result, self.guild.id)
                        .then(function(response) {
                            $mdToast.show(
                                $mdToast.simple()
                                .textContent('Guild name change to ' + result)
                                .position('bottom right')
                                .hideDelay(3000)
                            );

                            self.guild.name = result;
                            // $state.go('base.guilds.overview');
                        }, function() {
                            // Err
                        });

                }, function() {
                    // Cancel
                });
        }

    }

}());
