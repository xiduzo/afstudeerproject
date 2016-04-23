(function () {
    'use strict';

    angular
        .module('cmd.components')
        .controller('NavigationController', NavigationController);

    /** @ngInject */
    function NavigationController($rootScope, $mdSidenav, Account) {

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.toggleNavigation = toggleNavigation;
        self.logout = logout;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = $rootScope.Global.getUser();
        self.access = $rootScope.Global.getAccess();

        self.navigation = [
            {
                subgroup: 'coordinator',
                verbose: 'God',
                access_level: 3,
                items: [
                    {
                        name: 'Dashboard',
                        icon: 'dashboard_dark',
                        link_to: 'base',
                    },
                    {
                        name: 'Worlds',
                        icon: 'world_dark',
                        link_to: 'base.worlds.overview',
                    },
                    {
                        name: 'Tweak game',
                        icon: 'build_dark',
                        link_to: 'base',
                    }
                ],
            },
            {
                subgroup: 'lecturer',
                verbose: 'Game master',
                access_level: 2,
                items: [
                    {
                        name: 'Dashboard',
                        icon: 'dashboard_dark',
                        link_to: 'base',
                    },
                    {
                        name: 'Progress',
                        icon: 'timeline_dark',
                        link_to: 'base.progress.overview',
                    },
                    {
                        name: 'Guilds',
                        icon: 'guild_dark',
                        link_to: 'base.guilds.overview',
                    },
                ],
            },
            {
                subgroup: 'student',
                verbose: 'Player',
                access_level: 1,
                items: [
                    {
                        name: 'Dashboard',
                        icon: 'dashboard_dark',
                        link_to: 'base',
                    },
                    {
                        name: 'Guild',
                        icon: 'guild_dark',
                        link_to: 'base.guild.overview',
                    },
                    {
                        name: 'Questlog',
                        icon: 'book_dark',
                        link_to: 'base.quests.log',
                    },
                ],
            },
        ];

        $rootScope.$on('user-changed', function() {
            self.user = $rootScope.Global.getUser();
            self.access = $rootScope.Global.getAccess();
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function toggleNavigation() {
            // Opens and closes navigation
            $mdSidenav('main__navigation').toggle();
        }

        function logout() {
            Account.logout();
        }

    }

}());
