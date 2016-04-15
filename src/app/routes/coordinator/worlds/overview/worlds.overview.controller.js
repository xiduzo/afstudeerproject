(function () {
    'use strict';

    angular
        .module('cmd.worlds')
        .controller('WorldsOverviewController', WorldsOverviewController);

    /** @ngInject */
    function WorldsOverviewController($mdDialog) {

        var vm = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        vm.changeWorldName = changeWorldName;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        vm.worlds = {
            groen: {
                name: 'Groen',
                guilds: {
                    0: {
                        name: 'Guild 1'
                    },
                    1: {
                        name: 'Guild 2'
                    },
                    2: {
                        name: 'Guild 3'
                    },
                }
            },
            blauw: {
                name: 'Blauw',
                guilds: {
                    0: {
                        name: 'Guild 1'
                    },
                    1: {
                        name: 'Guild 2'
                    },
                    2: {
                        name: 'Guild 3'
                    },
                }
            },
            geel: {
                name: 'Geel',
                guilds: {
                    0: {
                        name: 'Guild 1'
                    },
                    1: {
                        name: 'Guild 2'
                    },
                    2: {
                        name: 'Guild 3'
                    },
                }
            },
            Rood: {
                name: 'Rood',
                guilds: {
                    0: {
                        name: 'Guild 1'
                    },
                    1: {
                        name: 'Guild 2'
                    },
                    2: {
                        name: 'Guild 3'
                    },
                }
            }
        };

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function changeWorldName(world) {
            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.prompt()
                .title('Enter a new name for '+world.name)
                .clickOutsideToClose(true)
                .placeholder('New world name')
                .ariaLabel('World name')
                .targetEvent(world)
                .ok('Change')
                .cancel('Cancel');

            $mdDialog
                .show(confirm)
                .then(function(result) {
                    if(!result) {
                        return;
                    }
                    // TODO
                    // Safe the new name to the DB
                    console.log('Save to DB');
                    world.name = result;
                }, function() {
                    console.log('Canceled');
                });
        }

    }

}());
