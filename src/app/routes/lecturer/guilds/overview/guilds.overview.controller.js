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

        var vm = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        vm.movePlayer = movePlayer;
        vm.newGuildDialog = newGuildDialog;
        vm.addGuildMember = addGuildMember;
        vm.removeGuildMember = removeGuildMember;
        vm.addHotkeys = addHotkeys;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        vm.worlds = [];
        vm.loading_page = true;
        vm.selected_world = Global.getSelectedWorld();

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          Broadcasts
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        $scope.$on('world-changed', function(event, world) {
          vm.selected_world = world;
          if(!_.findWhere(vm.worlds, { id: world})) {
            getWorld();
          }

          if(Global.getLocalSettings().enabled_hotkeys) {
              vm.addHotkeys();
          }
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function getWorld() {
          World.V2getWorld(vm.selected_world)
          .then(function(response) {

            vm.loading_page = false;

            var world = response.data;

            _.each(response.data.guilds, function(guild) {
              guild.members = [];
              Guild.getGuild(guild.id)
              .then(function(response) {
                _.each(response.members, function(member) {
                  member.user_id = member.user.id;
                  guild.members.push(member);
                });
              });
            });

            if(Global.getLocalSettings().enabled_hotkeys) {
              vm.addHotkeys();
            }

            vm.worlds.push(world);
          })
          .catch(function(error) {
            toastr.error(error);
          });
        }
        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        if(vm.selected_world) {
          getWorld();
        }

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
            if(!vm.selected_world) { return; }

            var world = _.findWhere(vm.worlds, {id: vm.selected_world});
            hotkeys.bindTo($scope)
            .add({
                combo: 'shift+c',
                description: 'Maak nieuw team',
                callback: function(event) {
                    vm.newGuildDialog(event, world);
                }
            });
        }

    }

}());
