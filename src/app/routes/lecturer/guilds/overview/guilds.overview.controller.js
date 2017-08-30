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
        toastr,
        World,
        LECTURER_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < LECTURER_ACCESS_LEVEL) {
            return Global.notAllowed();
        }

        Global.setRouteTitle('Teams overview');
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

            if(Global.getLocalSettings().enabled_hotkeys) {
                self.addHotkeys();
            }
            self.loading_page = false;
        }, function() {
            // Err
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Broadcasts
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        $rootScope.$on('world-changed', function(event, world) {
            self.selected_world = world;
            if(Global.getLocalSettings().enabled_hotkeys) {
                self.addHotkeys();
            }
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
                    toastr.success(player.user.first_name + ' verplaatst naar ' + guild.name);
                }, function() {
                    // Err
                });
            }
        }

        function newGuildDialog(event, world) {
            var dialog = $mdDialog.prompt()
                        .title('Voeg een nieuw team toe aan ' + world.name)
                        .textContent('Wat word de naam van dit team?')
                        .clickOutsideToClose(true)
                        .placeholder('Team naam')
                        .ariaLabel('Team naam')
                        .targetEvent(event)
                        .ok('Maak nieuw team')
                        .cancel('Sluit');

            $mdDialog.show(dialog)
                .then(function(result) {
                    // Ok

                    // Checks for the guild name
                    if(!result) {
                        toastr.warning('Vul een team naam in');
                        return;
                    }

                    Guild.addGuild(result, world.url)
                        .then(function(response) {
                            response.members = [];
                            world.guilds.unshift(response);
                            toastr.success('Team ' + response.name + ' aangemaakt');
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
                            title: 'Voeg studenten toe aan ' + guild.name,
                            subtitle: 'Selecteer studenten om toe te voegen',
                            about: 'studenten',
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
                                    toastr.success(user.first_name + ' toegevoegd aan ' + guild.name);
                                }, function() {
                                    // Err
                                });
                        });


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
                toastr.success(player.user.first_name + ' is verwijdert uit ' + guild.name);
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
                description: 'Maak nieuw team',
                callback: function(event) {
                    self.newGuildDialog(event, world);
                }
            });
        }

    }

}());
