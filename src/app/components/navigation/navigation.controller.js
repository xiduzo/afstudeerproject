(function () {
    'use strict';

    angular
        .module('cmd.components')
        .controller('NavigationController', NavigationController);

    /** @ngInject */
    function NavigationController(
        $rootScope,
        $mdSidenav,
        $state,
        Account,
        Global,
        Guild,
        World,
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
        self.active_menu_item = $state.current.name;
        self.changedWorld = changedWorld;
        self.changedGuild = changedGuild;


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.access = Global.getAccess();
        self.worlds = [];
        self.guilds = [];
        self.selected_world = null;
        self.selected_guild = null;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        World.getWorldsOfGamemaster(self.user.id)
        .then(function(response) {
            _.each(response.worlds, function(world) {
                self.worlds.push({id: world.world.id, name: world.world.name});
            });
            self.selected_world = _.first(self.worlds).id;
            Global.setSelectedWorld(self.selected_world);
        })
        .catch(function() {

        });

        Guild.getUserGuilds(self.user.id)
        .then(function(response) {
            _.each(response.guilds, function(guild) {
                self.guilds.push({id: guild.guild.id, name: guild.guild.name});
            });
            self.selected_guild = _.first(self.guilds).id;
            Global.setSelectedGuild(self.selected_guild);
        })
        .catch(function() {

        });


        self.main_navigation = [
            {
                subgroup: 'coordinator',
                verbose: 'Coordinator',
                access_levels: [COORDINATOR_ACCESS_LEVEL],
                items: [
                    {
                        name: 'Dashboard',
                        icon: 'dashboard_dark',
                        link_to: 'base.home',
                        access_levels: [COORDINATOR_ACCESS_LEVEL],
                    },
                    {
                        name: 'Classes',
                        icon: 'world_dark',
                        link_to: 'base.worlds.overview',
                        access_levels: [COORDINATOR_ACCESS_LEVEL],
                    }
                ],
            },
            {
                subgroup: 'lecturer',
                verbose: 'Lecturer',
                access_levels: [COORDINATOR_ACCESS_LEVEL, LECTURER_ACCESS_LEVEL],
                items: [
                    {
                        name: 'Dashboard',
                        icon: 'dashboard_dark',
                        link_to: 'base.home',
                        access_levels: [LECTURER_ACCESS_LEVEL],
                    },
                    {
                        name: 'Groups',
                        icon: 'guild_dark',
                        link_to: 'base.guilds.overview',
                        access_levels: [COORDINATOR_ACCESS_LEVEL, LECTURER_ACCESS_LEVEL],
                    },
                ],
            },
            {
                subgroup: 'student',
                verbose: 'Student',
                access_levels: [COORDINATOR_ACCESS_LEVEL, STUDENT_ACCESS_LEVEL],
                items: [
                    {
                        name: 'Dashboard',
                        icon: 'dashboard_dark',
                        link_to: 'base.home',
                        access_levels: [STUDENT_ACCESS_LEVEL]
                    },
                    {
                        name: 'Group',
                        icon: 'guild_dark',
                        link_to: 'base.guild.overview',
                        access_levels: [
                            COORDINATOR_ACCESS_LEVEL,
                            LECTURER_ACCESS_LEVEL,
                            STUDENT_ACCESS_LEVEL
                        ],
                    },
                    {
                        name: 'Assessments',
                        icon: 'book_dark',
                        link_to: 'base.quests.log',
                        access_levels: [
                            COORDINATOR_ACCESS_LEVEL,
                            LECTURER_ACCESS_LEVEL,
                            STUDENT_ACCESS_LEVEL
                        ],
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

        function changedWorld() {
            Global.setSelectedWorld(self.selected_world);
        }

        function changedGuild() {
            Global.setSelectedGuild(self.selected_guild);
        }

    }

}());
