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
        World,
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
        self.changeGuildName = changeGuildName;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.worlds = [];

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        World.getWorldsOfGamemaster(Global.getUser().uid)
            .then(function(response) {
                _.each(response, function(world) {
                    world.guilds = [];
                    self.worlds.push(world);
                    Guild.getGuilds(world.uuid)
                        .then(function(response) {
                            _.each(response, function(guild) {
                                guild.members = [];
                                world.guilds.push(guild);
                                Guild.getGuildMembers(guild.uuid)
                                    .then(function(response) {
                                        _.each(response, function(member) {
                                            guild.members.push(member);
                                        });
                                    }, function() {
                                        // Err
                                    });
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


        function newGuildDialog(event, world) {
            var dialog = $mdDialog.prompt()
                        .title('Add a new guild to ' + world.name)
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

                    Guild.addGuild(result, world.uuid)
                        .then(function(response) {
                            response.members = [];
                            world.guilds.unshift(response);
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

        function addGuildMember(event, world, guild) {

            Guild.getUsersWithoutGuild(world.uuid)
                .then(function(response) {

                    $mdDialog.show({
                        controller: 'AasController',
                        controllerAs: 'aasCtrl',
                        templateUrl: 'app/components/autocomplete_and_select/aas.html',
                        targetEvent: event,
                        clickOutsideToClose: true,
                        locals: {
                            title: 'Add members to this guild',
                            subtitle: 'Please select the players you would like to add.',
                            about: 'members',
                            players: response
                        }
                    })
                        .then(function(response) {
                            if(!response) {
                                return;
                            }

                            // Adding each lecturer to the world
                            _.each(response, function(user) {
                                Guild.addUserToGuild(user.uid, guild.uuid)
                                    .then(function(response) {
                                        user.guildUuid = guild.uuid;
                                        guild.members.push(user);
                                    }, function() {
                                        // Err
                                    });
                            });

                            $mdToast.show(
                                $mdToast.simple()
                                .textContent(response.length + ' member(s) added to ' + guild.name)
                                .position('bottom right')
                                .hideDelay(3000)
                            );

                        }, function() {
                            // Err
                        });

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
                    guild.members.splice(guild.members.indexOf(user), 1);
                }, function() {
                    // Err
                });
        }

        function changeGuildName(event, guild) {
            var dialog = $mdDialog.prompt()
                        .title('Change the guild name of "' +guild.name+ '"')
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

                    Guild.patchGuildName(result, guild.uuid)
                        .then(function(response) {
                            guild.name = result;
                            $mdToast.show(
                                $mdToast.simple()
                                .textContent('Guild name change to ' + result)
                                .position('bottom right')
                                .hideDelay(3000)
                            );
                        }, function() {
                            // Err
                        });

                }, function() {
                    // Cancel
                });
        }

    }

}());
