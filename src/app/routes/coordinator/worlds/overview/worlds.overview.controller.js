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
        COORDINATOR_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < COORDINATOR_ACCESS_LEVEL) {
            Global.notAllowed();
            return;
        }

        Global.setRouteTitle('Classes overview');

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

            self.addHotkeys();

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
            if(world.id === gamemaster.worldId) { return; }

            if((_.where(world.gamemasters, { id: gamemaster.id })).length >=2) {
                // Remove duplicate gamemasters in world
                World.removeGamemasterFromWorld(gamemaster.id, gamemaster.worldId);
                world.gamemasters.splice(world.gamemasters.indexOf(gamemaster), 1);
            } else {
                World.patchGamemasterWorld(gamemaster.id, gamemaster.woldId, world)
                .then(function(response) {
                    if(response.status >= 400) {
                        Global.statusCode(response);
                        return;
                    }

                    gamemaster.worldId = world.id;
                    Notifications.simpleToast(gamemaster.first_name + ' moved to ' + world.name);
                }, function() {
                    // Err patching gamemasters world
                });
            }
        }

        function newWorldDialog(event) {
            Notifications.prompt(
                'Add a new class',
                'How would you like to name the class?',
                'New class name',
                event
            )
            .then(function(result) {
                // Checks for the world name
                if(!result) {
                    return Notifications.simpleToast('Please enter a name');
                }

                World.addWorld(result)
                .then(function(response) {
                    self.worlds.unshift(response);
                    Notifications.simpleToast('Class ' + response.name + ' created');
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
                        title: 'Add lecturers to ' + world.name,
                        subtitle: 'Please select the lecturers.',
                        about: 'lecturers',
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
                            Notifications.simpleToast(user.first_name + ' added to ' + world.name);
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
            World.removeGamemasterFromWorld(gamemaster.uid, world.uuid)
            .then(function(response) {
                Notifications.simpleToast(gamemaster.first_name + ' got removed from ' + world.name);
                world.gamemasters.splice(world.gamemasters.indexOf(gamemaster), 1);
            }, function() {
                // Err remove gamemaster from world
            });
        }

        function addHotkeys() {
            hotkeys.bindTo($scope)
            .add({
                combo: 'shift+c',
                description: 'Add new world',
                callback: function(event) {
                    event.preventDefault();
                    self.newWorldDialog(event);
                }
            });

        }

    }

}());
