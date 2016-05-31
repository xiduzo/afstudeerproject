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
                                gamemaster.worldUuid = world.uuid;
                                world.gamemasters.push(gamemaster);
                            });
                        }, function() {
                            // Err
                        });
                });
            }, function() {
                // Err
            });

        World.getRestWorlds()
            .then(function(response) {
                console.log(response);
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

            if((_.where(world.gamemasters, { uid: gamemaster.uid })).length >=2) {
                // Remove duplicate gamemasters in world
                World.removeGamemasterFromWorld(gamemaster.uid, gamemaster.worldUuid);
                world.gamemasters.splice(world.gamemasters.indexOf(gamemaster), 1);
            } else {
                World.patchGamemasterWorld(gamemaster.uid, gamemaster.worldUuid, world.uuid)
                    .then(function(response) {
                        if(!response) {
                            return;
                        }

                        gamemaster.worldUuid = world.uuid;
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
                            response.gamemasters = [];
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

                            _.each(response, function(user) {
                                // Do not add lecturers which allready are lecturers in this world
                                // TODO
                                // dont give the option of selecting this users in the first place
                                if(_.where(world.gamemasters, { uid: user.uid }).length === 0) {
                                    World.addGamemasterToWorld(user.uid, world.uuid)
                                        .then(function(response) {
                                            user.worldUuid = world.uuid;
                                            world.gamemasters.push(user);
                                        }, function() {
                                            // Err
                                        });
                                }
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
