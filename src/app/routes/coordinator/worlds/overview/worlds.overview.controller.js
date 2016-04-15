(function () {
    'use strict';

    angular
        .module('cmd.worlds')
        .controller('WorldsOverviewController', WorldsOverviewController);

    /** @ngInject */
    function WorldsOverviewController($mdDialog, $mdToast) {

        var vm = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        vm.changeWorldName = changeWorldName;
        vm.moveGuild = moveGuild;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        vm.worlds = {
            groen: {
                name: 'Groen',
                color: '#23cd86',
                guilds: [
                    {
                        name: 'Guild g1'
                    },
                    {
                        name: 'Guild g2'
                    },
                    {
                        name: 'Guild g3'
                    }
                ]
            },
            blauw: {
                name: 'Blauw',
                color: '#2371cd',
                guilds: [
                    {
                        name: 'Guild b1'
                    },
                    {
                        name: 'Guild b2'
                    },
                    {
                        name: 'Guild b3'
                    }
                ]
            },
            geel: {
                name: 'Geel',
                color: '#b5cd23',
                guilds: [
                    {
                        name: 'Guild g1'
                    },
                    {
                        name: 'Guild g2'
                    },
                    {
                        name: 'Guild g3'
                    }
                ]
            },
            Rood: {
                name: 'Rood',
                color: '#cd2327',
                guilds: [
                    {
                        name: 'Guild r1'
                    },
                    {
                        name: 'Guild r2'
                    },
                    {
                        name: 'Guild r3'
                    }
                ]
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
                    world.name = result;
                    $mdToast.show(
                        $mdToast
                        .simple()
                        .position('bottom right')
                        .textContent('World name changed')
                        .hideDelay(1000)
                    );
                }, function() {
                    console.log('Canceled');
                });
        }

        function moveGuild(event, guild) {
            // TODO
            // Change the world ID of the guild
            $mdToast.show(
                $mdToast
                .simple()
                .position('bottom right')
                .textContent('Guild moved to new world')
                .hideDelay(1000)
            );
        }

    }

}());
