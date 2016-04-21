(function () {
    'use strict';

    angular
        .module('cmd.components')
        .controller('NavigationController', NavigationController);

    /** @ngInject */
    function NavigationController($rootScope, $mdSidenav, $state) {

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.toggleNavigation = toggleNavigation;
        self.logOut = logOut;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = $rootScope.Global.data.user;
        self.access = self.user.access;

        self.navigation = [
            {
                subgroup: 'coordinator',
                verbose: 'God',
                access_level: 3,
                items: [
                    {
                        name: 'Dashboard',
                        icon: 'dashboard_dark',
                        link_to: '',
                    },
                    {
                        name: 'Worlds',
                        icon: 'world_dark',
                        link_to: 'base.worlds.overview',
                    },
                    {
                        name: 'Tweak game',
                        icon: 'build_dark',
                        link_to: '',
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
                        link_to: '',
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
                        link_to: '',
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
            self.user = $rootScope.Global.data.user;
            self.access = self.user.access;
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function toggleNavigation() {
            // Opens and closes navigation
            $mdSidenav('main__navigation').toggle();
        }

        function logOut() {
            $rootScope.Global.data.user.data = {};
            $rootScope.Global.data.user.access = 0;
            $rootScope.$broadcast('user-changed');

            // TODO
            // Stop the side navigation from opening in the first place
            $mdSidenav('main__navigation').toggle();

            // Go back to the login page
            $state.go('base.account.login');
        }

    }

}());
