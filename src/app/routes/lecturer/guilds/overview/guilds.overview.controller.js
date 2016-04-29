(function () {
    'use strict';

    angular
        .module('cmd.guilds')
        .controller('GuildsOverviewController', GuildsOverviewController);

    /** @ngInject */
    function GuildsOverviewController(
        $mdToast,
        Guild,
        Global,
        LECTURER_ACCESS_LEVEL
    ) {

        if(Global.getAccess() !== LECTURER_ACCESS_LEVEL) {
            Global.notAllowed();
            return;
        }

        var vm = this;

        Guild.getGuilds('1233');

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        vm.movePlayer = movePlayer;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        vm.guilds = {
            0: {
                name: 'Guild 1',
                id: 1,
                players: [
                    {
                        name: 'Player 1 g1',
                        guild: 1
                    },
                    {
                        name: 'Player 2 g1',
                        guild: 1
                    },
                    {
                        name: 'Player 3 g1',
                        guild: 1
                    }
                ]
            },
            1: {
                name: 'Guild 2',
                id: 2,
                players: [
                    {
                        name: 'Player 1 g2',
                        guild: 2
                    },
                    {
                        name: 'Player 2 g2',
                        guild: 2
                    },
                    {
                        name: 'Player 3 g2',
                        guild: 2
                    }
                ]
            },
            2: {
                name: 'Guild 3',
                id: 3,
                players: [
                    {
                        name: 'Player 1 g3',
                        guild: 3
                    },
                    {
                        name: 'Player 2 g3',
                        guild: 3
                    },
                    {
                        name: 'Player 3 g3',
                        guild: 3
                    }
                ]
            },
            3: {
                name: 'Guild 4',
                id: 4,
                players: [
                    {
                        name: 'Player 1 g4',
                        guild: 4
                    },
                    {
                        name: 'Player 2 g4',
                        guild: 4
                    },
                    {
                        name: 'Player 3 g4',
                        guild: 4
                    }
                ]
            }
        };

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function movePlayer(event, guild, player) {
            if(guild.id === player.guild.id) {
                return;
            }

            player.guild = guild.id;

            $mdToast.show(
                $mdToast
                .simple()
                .position('bottom right')
                .textContent('Player moved to new guild')
                .hideDelay(1000)
            );
        }

    }

}());
