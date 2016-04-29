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
        self.moveGuild = moveGuild;
        self.newWorldDialog = newWorldDialog;
        self.changeWorldName = changeWorldName;

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
                    // console.log(world);
                    self.worlds.push(world);
                });
                // console.log(response);
            }, function() {
                // reject
            });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function moveGuild(event, world, guild) {
            if(world.id === guild.world) {
                return;
            }
            // TODO
            // Change the world ID of the guild

            guild.world = world.id;

            $mdToast.show(
                $mdToast
                .simple()
                .position('bottom right')
                .textContent('Guild moved to new world')
                .hideDelay(1000)
            );
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

                    World
                        .addWorld(result)
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

                    // World
                    //     .addWorld(result)
                    //     .then(function(response) {
                    //         self.worlds.unshift(response);
                    //         $mdToast.show(
                    //             $mdToast.simple()
                    //             .textContent('World ' + response.name + ' created')
                    //             .position('bottom right')
                    //             .hideDelay(3000)
                    //         );
                    //     }, function() {
                    //
                    //     });

                }, function() {
                    // Cancel
                });
        }

    }

}());
