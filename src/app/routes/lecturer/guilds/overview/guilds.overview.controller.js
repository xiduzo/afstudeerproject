(function () {
    'use strict';

    angular
        .module('cmd.guilds')
        .controller('GuildsOverviewController', GuildsOverviewController);

    /** @ngInject */
    function GuildsOverviewController(
        $mdDialog,
        $mdToast,
        Guild,
        Global,
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
        self.movePlayer = movePlayer;
        self.newGuildDialog = newGuildDialog;
        self.addGuildMember = addGuildMember;
        self.removeGuildMember = removeGuildMember;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.guilds = [];

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getGuilds()
            .then(function(response) {
                _.each(response, function(guild) {
                    guild.players = [];
                    self.guilds.push(guild);

                    Guild.getGuildMembers(guild.uuid)
                        .then(function(response) {
                            _.each(response, function(user) {
                                user.guildUuid = guild.uuid;
                                guild.players.push(user);
                            });
                        }, function() {
                            // Err
                        });
                });
            }, function() {
                // Err
            });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function movePlayer(event, guild, user) {
            if(guild.uuid === user.guildUuid) {
                return;
            }

            Guild.patchPlayersGuild(user.uid, guild.uuid)
                .then(function(response) {
                    user.guildUuid = guild.uuid;
                    $mdToast.show(
                        $mdToast
                        .simple()
                        .position('bottom right')
                        .textContent(user.displayname + ' moved to ' + guild.name)
                        .hideDelay(1000)
                    );
                }, function() {
                    // Err
                });

            // player.guildUuid = guild.uuid;
            //
        }


        function newGuildDialog(event) {
            var dialog = $mdDialog.prompt()
                        .title('Add a new guild to [WORLD NAME]')
                        .textContent('How would you like to name the new guild?')
                        .clickOutsideToClose(true)
                        .placeholder('New guild name')
                        .ariaLabel('New guild name')
                        .targetEvent(event)
                        .ok('Create new guild')
                        .cancel('Cancel');

            $mdDialog.show(dialog)
                .then(function(result) {
                    // Ok

                    // Checks for the guild name
                    if(!result) {
                        $mdToast.show(
                            $mdToast.simple()
                            .textContent('Please enter a guild name')
                            .position('bottom right')
                            .hideDelay(3000)
                        );
                        return;
                    }

                    Guild
                        .addGuild(result)
                        .then(function(response) {
                            response.players = [];
                            self.guilds.unshift(response);
                            $mdToast.show(
                                $mdToast.simple()
                                .textContent('Guild ' + response.name + ' created')
                                .position('bottom right')
                                .hideDelay(3000)
                            );
                        }, function() {

                        });

                }, function() {
                    // Cancel
                });
        }

        function addGuildMember(event, guild) {

            $mdDialog.show({
                controller: 'GuildsAddMemberController',
                controllerAs: 'guildsAddMemberCtrl',
                templateUrl: 'app/routes/lecturer/guilds/overview/addMember/addMember.html',
                targetEvent: event,
                clickOutsideToClose: true,
                locals: {
                    guildUuid: guild.uuid
                }
            })
                .then(function(response) {
                    if(!response) {
                        return;
                    }

                    // Adding each user to the guild
                    _.each(response, function(user) {
                        Guild.addUserToGuild(user.uid, guild.uuid)
                            .then(function(response) {
                                user.guildUuid = guild.uuid;
                                guild.players.push(user);
                            }, function() {
                                // Err
                            });
                    });

                    $mdToast.show(
                        $mdToast.simple()
                        .textContent(response.length + ' player(s) added to ' + guild.name)
                        .position('bottom right')
                        .hideDelay(3000)
                    );

                }, function() {
                    // Err
                });
        }

        function removeGuildMember(user, guild) {
            Guild.removeUserFromGuild(user.uid, guild.uuid)
                .then(function(response) {
                    if(!response) {
                        return;
                    }
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent(user.displayname + ' got removed from ' + guild.name)
                        .position('bottom right')
                        .hideDelay(3000)
                    );
                    guild.players.splice(guild.players.indexOf(user), 1);
                }, function() {
                    // Err
                });
        }

    }

}());
