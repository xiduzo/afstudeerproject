(function () {
    'use strict';

    angular
        .module('cmd.guilds')
        .controller('GuildsOverviewController', GuildsOverviewController);

    /** @ngInject */
    function GuildsOverviewController(
        $scope,
        $mdDialog,
        $mdToast,
        $rootScope,
        $state,
        hotkeys,
        Account,
        Guild,
        Global,
        Notifications,
        World,
        LECTURER_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < LECTURER_ACCESS_LEVEL) {
            Global.notAllowed();
            return;
        }

        Global.setRouteTitle('Groups overview');
        Global.setRouteBackRoute(null);

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.movePlayer = movePlayer;
        self.newGuildDialog = newGuildDialog;
        self.addGuildMember = addGuildMember;
        self.removeGuildMember = removeGuildMember;
        self.addHotkeys = addHotkeys;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.worlds = [];
        self.loading_page = true;
        self.selected_world = Global.getSelectedWorld();

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        World.getWorldsOfGamemaster(Global.getUser().id)
        .then(function(response) {
            if(response.status >= 400) {
                return Global.statusCode(response);
            }

            _.each(response.worlds, function(world) {
                // Adding the world to the frontend
                _.each(world.world.guilds, function(guild) {
                    _.each(guild.members, function(member) {
                        // Adding guild id for moving players around
                        member.user.guildId = guild.id;
                    });
                });
                self.worlds.push(world.world);
            });

            if(_.findWhere(self.worlds, {id: self.selected_world})) {
                Global.setRouteTitle('Groups overview', _.findWhere(self.worlds, {id: self.selected_world}).name);
            }

            self.addHotkeys();
            self.loading_page = false;
        }, function() {
            // Err
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Broadcasts
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        $rootScope.$on('world-changed', function(event, world) {
            self.selected_world = world;
            self.addHotkeys();
            Global.setRouteTitle('Groups overview', _.findWhere(self.worlds, {id: self.selected_world}).name);
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function movePlayer(event, guild, player) {
            if(guild.id === player.user.guildId) {
                return;
            }
            if((_.where(guild.members, { id: player.user.id })).length >=2) {
                // Remove duplicate members in world
                Guild.removeUserFromGuild(player.user.id, player.user.guilId);
                guild.members.splice(guild.members.indexOf(player), 1);
            } else {
                Guild.patchPlayersGuild(player.user.id, player.user.guildId, guild)
                .then(function(response) {
                    player.user.guildId = guild.id;
                    Notifications.simpleToast(player.user.first_name + ' moved to ' + guild.name);
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
                        Notifications.simpleToast('Please enter a group name');
                        return;
                    }

                    Guild.addGuild(result, world.url)
                        .then(function(response) {
                            response.members = [];
                            world.guilds.unshift(response);
                            Notifications.simpleToast('Group ' + response.name + ' created');
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
                                    guild.members.push({user: user});
                                }, function() {
                                    // Err
                                });
                        });

                        Notifications.simpleToast(response.length + ' member(s) added to ' + guild.name);

                    }, function() {
                        // Err
                    });

                }, function() {
                    // Err
                });
        }

        function removeGuildMember(player, guild) {
            Guild.removeUserFromGuild(player.user.id, guild.id)
            .then(function(response) {
                Notifications.simpleToast(player.user.first_name + ' got removed from ' + guild.name);
                guild.members.splice(guild.members.indexOf(player), 1);
            }, function() {
                // Err
            });
        }

        function addHotkeys() {
            if(!self.selected_world) { return; }

            var world = _.findWhere(self.worlds, {id: self.selected_world});
            hotkeys.bindTo($scope)
            .add({
                combo: 'shift+c',
                description: 'Create new group',
                callback: function(event) {
                    self.newGuildDialog(event, world);
                }
            });
        }

    }

}());
