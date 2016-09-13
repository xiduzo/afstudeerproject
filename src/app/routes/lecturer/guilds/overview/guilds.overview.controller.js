(function () {
    'use strict';

    angular
        .module('cmd.guilds')
        .controller('GuildsOverviewController', GuildsOverviewController);

    /** @ngInject */
    function GuildsOverviewController(
        $mdDialog,
        $mdToast,
        Account,
        Guild,
        Global,
        World,
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
        self.movePlayer = movePlayer;
        self.newGuildDialog = newGuildDialog;
        self.addGuildMember = addGuildMember;
        self.removeGuildMember = removeGuildMember;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.worlds = [];

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        World.getWorldsOfGamemaster(Global.getUser().id)
            .then(function(response) {
                if(response.status >= 400) {
                    Global.statusCode(response);
                    return;
                }

                _.each(response.worlds, function(world) {
                    // Adding the world to the frontend
                    _.each(world.world.guilds, function(guild) {
                        _.each(guild.members, function(member) {
                            // Adding guild id for moving players around
                            member.guildId = guild.id;
                        });
                    });
                    self.worlds.push(world.world);
                });
            }, function() {
                // Err
            });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function movePlayer(event, guild, user) {
            if(guild.id === user.guildId) {
                return;
            }
            if((_.where(guild.members, { id: user.id })).length >=2) {
                // Remove duplicate members in world
                Guild.removeUserFromGuild(user.id, user.guilId);
                guild.members.splice(guild.members.indexOf(user), 1);
            } else {
                Guild.patchPlayersGuild(user.id, user.guildId, guild)
                    .then(function(response) {
                        user.guildId = guild.id;
                        $mdToast.show(
                            $mdToast
                            .simple()
                            .position('bottom right')
                            .textContent(user.first_name + ' moved to ' + guild.name)
                            .hideDelay(1000)
                        );
                    }, function() {
                        // Err
                    });
            }
        }


        function newGuildDialog(event, world) {
            var dialog = $mdDialog.prompt()
                        .title('Add a new group to ' + world.name)
                        .textContent('How would you like to name the new group?')
                        .clickOutsideToClose(true)
                        .placeholder('New group name')
                        .ariaLabel('New group name')
                        .targetEvent(event)
                        .ok('Create new group')
                        .cancel('Cancel');

            $mdDialog.show(dialog)
                .then(function(result) {
                    // Ok

                    // Checks for the guild name
                    if(!result) {
                        Global.simpleToast('Please enter a group name');
                        return;
                    }

                    Guild.addGuild(result, world.url)
                        .then(function(response) {
                            console.log(response);
                            response.members = [];
                            world.guilds.unshift(response);
                            Global.simpleToast('Group ' + response.name + ' created');
                        }, function() {

                        });

                }, function() {
                    // Cancel
                });
        }

        function addGuildMember(event, world, guild) {

            Account.getStudents()
                .then(function(response) {

                    // Filter out the users allready in the guild
                    response = _.filter(response, function(user) {
                        if(_.where(guild.members, { id: user.id }).length === 0) {
                            return user;
                        }
                    });
                    $mdDialog.show({
                        controller: 'AasController',
                        controllerAs: 'aasCtrl',
                        templateUrl: 'app/components/autocomplete_and_select/aas.html',
                        targetEvent: event,
                        clickOutsideToClose: true,
                        locals: {
                            title: 'Add students to ' + guild.name,
                            subtitle: 'Please select the students you would like to add.',
                            about: 'students',
                            players: response
                        }
                    })
                        .then(function(response) {
                            if(!response) {
                                return;
                            }

                            // Adding each lecturer to the world
                            _.each(response, function(user) {
                                Guild.addUserToGuild(user.url, guild.url)
                                    .then(function(response) {
                                        user.guildId = guild.id;
                                        guild.members.push(user);
                                    }, function() {
                                        // Err
                                    });
                            });

                            Global.simpleToast(response.length + ' member(s) added to ' + guild.name);

                        }, function() {
                            // Err
                        });

                }, function() {
                    // Err
                });
        }

        function removeGuildMember(user, guild) {
            Guild.removeUserFromGuild(user.id, guild.id)
                .then(function(response) {
                    Global.simpleToast(user.first_name + ' got removed from ' + guild.name);
                    guild.members.splice(guild.members.indexOf(user), 1);
                }, function() {
                    // Err
                });
        }

    }

}());
