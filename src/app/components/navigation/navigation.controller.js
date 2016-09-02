(function () {
    'use strict';

    angular
        .module('cmd.components')
        .controller('NavigationController', NavigationController);

    /** @ngInject */
    function NavigationController(
        $rootScope,
        $mdSidenav,
        Account,
        STUDENT_ACCESS_LEVEL,
        LECTURER_ACCESS_LEVEL,
        COORDINATOR_ACCESS_LEVEL
    ) {

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

        self.main_navigation = [
            {
                subgroup: 'coordinator',
                verbose: 'Coordinator',
                access_level: COORDINATOR_ACCESS_LEVEL,
                items: [
                    {
                        name: 'Dashboard',
                        icon: 'dashboard_dark',
                        link_to: 'base.home',
                    },
                    {
                        name: 'Classes',
                        icon: 'world_dark',
                        link_to: 'base.worlds.overview',
                    }
                ],
            },
            {
                subgroup: 'lecturer',
                verbose: 'Lecturer',
                access_level: LECTURER_ACCESS_LEVEL,
                items: [
                    {
                        name: 'Dashboard',
                        icon: 'dashboard_dark',
                        link_to: 'base.home',
                    },
                    {
                        name: 'Groups',
                        icon: 'guild_dark',
                        link_to: 'base.guilds.overview',
                    },
                ],
            },
            {
                subgroup: 'student',
                verbose: 'Student',
                access_level: STUDENT_ACCESS_LEVEL,
                items: [
                    {
                        name: 'Dashboard',
                        icon: 'dashboard_dark',
                        link_to: 'base.home',
                    },
                    {
                        name: 'Group',
                        icon: 'guild_dark',
                        link_to: 'base.guild.overview',
                    },
                    {
                        name: 'Assignments',
                        icon: 'book_dark',
                        link_to: 'base.quests.log',
                    },
                ],
            },
        ];

        self.account_navigation = {
            access_level: STUDENT_ACCESS_LEVEL,
            subgroup: 'account',
            verbose: 'Account',
            items: [
                {
                    name: 'Profile',
                    icon: 'person_dark',
                    link_to: 'base.account.detail'
                },
                {
                    name: 'Settings',
                    icon: 'settings_dark',
                    link_to: 'base.account.settings'
                }
            ]
        };

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
            // Close the navigation
            self.toggleNavigation();

            // Logout the user
            Account.logout();
        }

    }

}());
