(function () {
    'use strict';

    angular
        .module('cmd.worlds')
        .controller('WorldsOverviewController', WorldsOverviewController);

    /** @ngInject */
    function WorldsOverviewController(
        $scope,
        $state,
        $mdDialog,
        $mdToast,
        hotkeys,
        Account,
        Global,
        Notifications,
        World,
        toastr,
        COORDINATOR_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < COORDINATOR_ACCESS_LEVEL) {
            return Global.notAllowed();
        }

        Global.setRouteTitle('Klassen overzicht');
        Global.setRouteBackRoute(null);

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.moveGamemaster = moveGamemaster;
        self.newWorldDialog = newWorldDialog;
        self.addGamemaster = addGamemaster;
        self.removeGamemaster = removeGamemaster;
        self.addHotkeys = addHotkeys;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.worlds = [];
        self.loading_page = true;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        World.getWorlds()
        .then(function(response) {

            if(response.status === -1) {
                Global.noConnection();
                return;
            }

            _.each(response, function(world) {
                // Add the world to the gamemaster
                _.each(world.gamemasters, function(gamemaster) {
                    gamemaster.worldId = world.id;
                });
                self.worlds.push(world);
            });

            if(Global.getLocalSettings().enabled_hotkeys) {
                self.addHotkeys();
            }

            self.loading_page = false;
        }, function() {
            // Err getting worlds
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function moveGamemaster(event, world, gamemaster) {
            if(world.id === gamemaster.worldId) { return false; }

            if((_.where(world.gamemasters, { id: gamemaster.id })).length >=2) {
                // Remove duplicate gamemasters in world
                World.removeGamemasterFromWorld(gamemaster.id, gamemaster.worldId);
                world.gamemasters.splice(world.gamemasters.indexOf(gamemaster), 1);
                toastr.info(gamemaster.first_name + ' was al een docent van ' + world.name);
            } else {
                World.removeGamemasterFromWorld(gamemaster.id, gamemaster.worldId);
                World.addGamemasterToWorld(gamemaster.url, world.url)
                .then(function(response) {
                    if(response.status >= 400) { return Global.statusCode(response); }
                    gamemaster.worldId = world.id;
                    toastr.success(gamemaster.first_name + ' toegevoegd aan ' + world.name);
                }, function() {
                    // Err adding gamemaster to world
                });
            }
        }

        function newWorldDialog(event) {
            Notifications.prompt(
                'Nieuwe klas toevoegen',
                'Wat word de naam van deze klas?',
                'Naam nieuwe klas',
                event
            )
            .then(function(result) {
                // Checks for the world name
                if(!result) {
                    return toastr.warning('Vul een naam in.');
                }

                World.addWorld(result)
                .then(function(response) {
                    self.worlds.unshift(response);
                    toastr.success('Klas ' + response.name + ' aangemaakt');
                }, function() {
                    // Err creating world
                });
            }, function() {
                // Cancel dialog
            });
        }

        function addGamemaster(event, world) {
            Account.getLecturers()
            .then(function(response) {
                // Filter out the gamemaster allready in the world
                response = _.filter(response, function(user) {
                    if(_.where(world.gamemasters, { id: user.id }).length === 0) {
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
                        title: 'Voeg docent toe aan ' + world.name,
                        subtitle: 'Selecteer docenten.',
                        about: 'docenten',
                        players: response,
                        guildUuid: world.uuid
                    }
                })
                .then(function(response) {
                    if(!response) { return; }

                    _.each(response, function(user) {
                        World.addGamemasterToWorld(user.url, world.url)
                        .then(function(response) {
                            if(response.status >= 400) {
                                Global.statusCode(response);
                                return;
                            }
                            user.worldId = world.id;
                            world.gamemasters.push(user);
                            toastr.success(user.first_name + ' toegevoegd aan ' + world.name);
                        }, function() {
                            // Err adding gamemaster to world
                        });
                    });
                }, function() {
                    // Cancel dialog
                });
            }, function() {
                // Err getting lecturers
            });
        }

        function removeGamemaster(gamemaster, world) {
          console.log(gamemaster, world);
            World.removeGamemasterFromWorld(gamemaster.id, world.id)
            .then(function(response) {
                toastr.success(gamemaster.first_name + ' is verwijderd van ' + world.name);
                world.gamemasters.splice(world.gamemasters.indexOf(gamemaster), 1);
            }, function() {
                // Err remove gamemaster from world
            });
        }

        function addHotkeys() {
            hotkeys.bindTo($scope)
            .add({
                combo: 'shift+c',
                description: 'Nieuwe klas',
                callback: function(event) {
                    event.preventDefault();
                    self.newWorldDialog(event);
                }
            });

        }

    }

}());
