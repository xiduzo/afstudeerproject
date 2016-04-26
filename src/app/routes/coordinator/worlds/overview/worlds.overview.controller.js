(function () {
    'use strict';

    angular
        .module('cmd.worlds')
        .controller('WorldsOverviewController', WorldsOverviewController);

    /** @ngInject */
    function WorldsOverviewController(
        $mdToast,
        COORDINATOR_ACCESS_LEVEL
    ) {

        if(Global.getAccess() !== COORDINATOR_ACCESS_LEVEL) {
            $mdToast.show(
                $mdToast.simple()
                .textContent('You are not allowed to view this page')
                .position('bottom right')
                .hideDelay(3000)
            );
            $state.go('base.home');
            return;
        }

        var vm = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        vm.moveGuild = moveGuild;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        vm.worlds = {
            groen: {
                name: 'Groen',
                id: 1,
                guilds: [
                    {
                        name: 'Guild g1',
                        world: 1
                    },
                    {
                        name: 'Guild g2',
                        world: 1
                    },
                    {
                        name: 'Guild g3',
                        world: 1
                    }
                ]
            },
            blauw: {
                name: 'Blauw',
                id: 2,
                guilds: [
                    {
                        name: 'Guild b1',
                        world: 2
                    },
                    {
                        name: 'Guild b2',
                        world: 2
                    },
                    {
                        name: 'Guild b3',
                        world: 2
                    }
                ]
            },
            geel: {
                name: 'Geel',
                id: 3,
                guilds: [
                    {
                        name: 'Guild g1',
                        world: 3
                    },
                    {
                        name: 'Guild g2',
                        world: 3
                    },
                    {
                        name: 'Guild g3',
                        world: 3
                    }
                ]
            },
            Rood: {
                name: 'Rood',
                id: 4,
                guilds: [
                    {
                        name: 'Guild r1',
                        world: 4
                    },
                    {
                        name: 'Guild r2',
                        world: 4
                    },
                    {
                        name: 'Guild r3',
                        world: 4
                    }
                ]
            }
        };

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

    }

}());
