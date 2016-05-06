(function () {
    'use strict';

    angular
        .module('cmd.worlds')
        .controller('WorldsOverviewController', WorldsOverviewController);

    /** @ngInject */
    function WorldsOverviewController(
        $mdDialog,
        $mdToast,
        Global,
        World,
        COORDINATOR_ACCESS_LEVEL
    ) {

        if(Global.getAccess() !== COORDINATOR_ACCESS_LEVEL) {
            Global.notAllowed();
            return;
        }

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.moveGamemaster = moveGamemaster;
        self.newWorldDialog = newWorldDialog;
        self.changeWorldName = changeWorldName;
        self.addGamemaster = addGamemaster;
        self.removeGamemaster = removeGamemaster;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.worlds = [];

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        World.getWorlds()
            .then(function(response) {
                _.each(response, function(world) {
                    world.gamemasters = [];
                    self.worlds.push(world);
                    World.getGamemasters(world.uuid)
                        .then(function(response) {
                            _.each(response, function(gamemaster) {
                                world.gamemasters.push(gamemaster);
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
        function moveGamemaster(event, world, gamemaster) {
            if(world.uuid === gamemaster.worldUuid) {
                return;
            }
            // // TODO
            // // Change the world ID of the guild
            //
            // guild.world = world.id;
            //
            World.patchGamemasterWorld(gamemaster.uid, world.uuid)
                .then(function(response) {
                    if(!response) {
                        return;
                    }

                    $mdToast.show(
                        $mdToast
                        .simple()
                        .position('bottom right')
                        .textContent(gamemaster.displayname + ' moved to ' + world.name)
                        .hideDelay(1000)
                    );
                }, function() {
                    // Err
                });
        }

        function newWorldDialog(event) {
            var dialog = $mdDialog.prompt()
                        .title('Add a new world to [PLATFORM NAME]')
                        .textContent('How would you like to name the new world?')
                        .clickOutsideToClose(true)
                        .placeholder('New world name')
                        .ariaLabel('New world name')
                        .targetEvent(event)
                        .ok('Create new world')
                        .cancel('Cancel');

            $mdDialog.show(dialog)
                .then(function(result) {
                    // Ok

                    // Checks for the world name
                    if(!result) {
                        $mdToast.show(
                            $mdToast.simple()
                            .textContent('Please enter a worldname')
                            .position('bottom right')
                            .hideDelay(3000)
                        );
                        return;
                    }

                    World.addWorld(result)
                        .then(function(response) {
                            self.worlds.unshift(response);
                            $mdToast.show(
                                $mdToast.simple()
                                .textContent('World ' + response.name + ' created')
                                .position('bottom right')
                                .hideDelay(3000)
                            );
                        }, function() {

                        });

                }, function() {
                    // Cancel
                });

        }

        function changeWorldName(event, world) {
            var dialog = $mdDialog.prompt()
                        .title('Change the world name of "' +world.name+ '"')
                        .textContent('How would you like to name this world?')
                        .clickOutsideToClose(true)
                        .placeholder('World name')
                        .ariaLabel('World name')
                        .targetEvent(event)
                        .ok('Change world name')
                        .cancel('Cancel');

            $mdDialog.show(dialog)
                .then(function(result) {
                    // Ok

                    // Checks for thw world name
                    if(!result) {
                        $mdToast.show(
                            $mdToast.simple()
                            .textContent('Please enter a worldname')
                            .position('bottom right')
                            .hideDelay(3000)
                        );
                        return;
                    }

                    World.changeWorldName(result, world.uuid)
                        .then(function(response) {
                            world.name = result;
                            $mdToast.show(
                                $mdToast.simple()
                                .textContent('World name change to ' + result)
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

        function addGamemaster(event, world) {
            World.getLecturers(world.uuid)
                .then(function(response) {

                    $mdDialog.show({
                        controller: 'AasController',
                        controllerAs: 'aasCtrl',
                        templateUrl: 'app/components/autocomplete_and_select/aas.html',
                        targetEvent: event,
                        clickOutsideToClose: true,
                        locals: {
                            title: 'Add gamemasters to this world',
                            subtitle: 'Please select the gamemasters which shall protect this world.',
                            about: 'gamemasters',
                            players: response,
                            guildUuid: world.uuid
                        }
                    })
                        .then(function(response) {
                            if(!response) {
                                return;
                            }

                            // Adding each lecturer to the world
                            _.each(response, function(user) {
                                World.addGamemasterToWorld(user.uid, world.uuid)
                                    .then(function(response) {
                                        user.worldUuid = world.uuid;
                                        world.gamemasters.push(user);
                                    }, function() {
                                        // Err
                                    });
                            });

                            $mdToast.show(
                                $mdToast.simple()
                                .textContent(response.length + ' gamemaster(s) added to ' + world.name)
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

        function removeGamemaster(gamemaster, world) {
            World.removeGamemasterFromWorld(gamemaster.uid, world.uuid)
                .then(function(response) {
                    if(!response) {
                        return;
                    }

                    $mdToast.show(
                        $mdToast.simple()
                        .textContent(gamemaster.displayname + ' got removed from ' + world.name)
                        .position('bottom right')
                        .hideDelay(3000)
                    );

                    world.gamemasters.splice(world.gamemasters.indexOf(gamemaster), 1);

                }, function() {
                    // Err
                });
        }

    }

}());
