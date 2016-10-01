(function () {
    'use strict';

    angular
        .module('cmd.components')
        .controller('NavigationController', NavigationController);

    /** @ngInject */
    function NavigationController(
        $scope,
        $rootScope,
        $mdSidenav,
        $state,
        hotkeys,
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
        self.changeState = changeState;
        self.addHotkeys = addHotkeys;
        self.removeHotkeys = removeHotkeys;
        self.getWorldsAndGuilds = getWorldsAndGuilds;


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.access = Global.getAccess();
        self.worlds = [];
        self.guilds = [];
        self.selected_world = null;
        self.selected_guild = null;

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
                    {
                        name: 'Assessments',
                        icon: 'book_dark',
                        link_to: 'base.progress.overview',
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

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        if(self.user.id) {
            self.getWorldsAndGuilds();
            self.addHotkeys();
        }

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              Broadcasts
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        $rootScope.$on('user-changed', function() {
            self.user = $rootScope.Global.getUser();
            self.access = $rootScope.Global.getAccess();
            if(self.user.id) {
                self.getWorldsAndGuilds();
                self.addHotkeys();
            } else {
                self.removeHotkeys();
            }
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

            // Remove all the hotkeys
            self.removeHotkeys();
        }

        function changedWorld() {
            Global.setSelectedWorld(self.selected_world);
        }

        function changedGuild() {
            Global.setSelectedGuild(self.selected_guild);
        }

        function changeState(state) {
            $state.go(state);
            self.active_menu_item = state;
        }

        function addHotkeys() {
            if(self.user.is_superuser) {
                hotkeys.bindTo($scope)
                .add({
                    combo: 'c',
                    description: 'Goto classes',
                    callback: function() {
                        self.changeState('base.worlds.overview');
                    }
                })
                ; // End of hotkeys
            }

            if(self.user.is_staff) {
                hotkeys.bindTo($scope)
                .add({
                    combo: 'g',
                    description: 'Goto groups',
                    callback: function() {
                        self.changeState('base.guilds.overview');
                    }
                })
                .add({
                    combo: 'a',
                    description: 'Goto assessments',
                    callback: function() {
                        self.changeState('base.progress.overview');
                    }
                })
                ; // End of hotkeys
            }

            if(!self.user.is_superuser && !self.user.is_staff) {
                hotkeys.bindTo($scope)
                .add({
                    combo: 'g',
                    description: 'Goto group',
                    callback: function() {
                        self.changeState('base.guild.overview');
                    }
                })
                .add({
                    combo: 'a',
                    description: 'Goto assessments',
                    callback: function() {
                        self.changeState('base.quest.log');
                    }
                })
                ; // End of hotkeys
            }

            // Every one can see this one
            hotkeys.bindTo($scope)
            .add({
                combo: 'p',
                description: 'Goto profile',
                callback: function() {
                    self.changeState('base.account.detail');
                }
            })
            .add({
                combo: 'd',
                description: 'Goto dashboard',
                callback: function() {
                    self.changeState('base.home');
                }
            })
            .add({
                combo: 'l',
                description: 'Logout',
                callback: function() {
                    self.logout();
                }
            })
            ; // End of hotkeys
        }

        function removeHotkeys() {
            hotkeys.del('c');
            hotkeys.del('g');
            hotkeys.del('a');
            hotkeys.del('p');
            hotkeys.del('d');
            hotkeys.del('l');
        }

        function getWorldsAndGuilds() {

            World.getWorldsOfGamemaster(self.user.id)
            .then(function(response) {
                self.worlds = [];
                self.selected_world = null;
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
                self.guilds = [];
                self.selected_guild = null;
                _.each(response.guilds, function(guild) {
                    self.guilds.push({id: guild.guild.id, name: guild.guild.name});
                });
                self.selected_guild = _.first(self.guilds).id;
                Global.setSelectedGuild(self.selected_guild);
            })
            .catch(function() {

            });
        }

    }

}());
