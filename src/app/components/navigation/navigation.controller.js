(function () {
    'use strict';

    angular
        .module('cmd.components')
        .controller('NavigationController', NavigationController);

    /** @ngInject */
    function NavigationController(
        $scope,
        $mdSidenav,
        $state,
        hotkeys,
        Global,
        STUDENT_ACCESS_LEVEL,
        LECTURER_ACCESS_LEVEL,
        COORDINATOR_ACCESS_LEVEL
    ) {

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.toggleNavigation = toggleNavigation;
        self.active_menu_item = $state.current.name;
        self.changeState = changeState;
        self.addHotkeys = addHotkeys;
        self.removeHotkeys = removeHotkeys;

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
                access_levels: [COORDINATOR_ACCESS_LEVEL],
                items: [
                    // {
                    //     name: 'Dashboard',
                    //     icon: 'dashboard_dark',
                    //     link_to: 'base.home.dashboards.coordinator',
                    //     access_levels: [COORDINATOR_ACCESS_LEVEL],
                    // },
                    {
                        name: 'Classes',
                        icon: 'world_dark',
                        link_to: 'base.worlds.overview',
                        access_levels: [COORDINATOR_ACCESS_LEVEL],
                    },
                    {
                        name: 'Rules',
                        icon: 'rules_dark',
                        link_to: 'base.rules.overview',
                        access_levels: [COORDINATOR_ACCESS_LEVEL],
                    },
                ],
            },
            {
                subgroup: 'lecturer',
                access_levels: [COORDINATOR_ACCESS_LEVEL, LECTURER_ACCESS_LEVEL],
                items: [
                    {
                        name: 'Dashboard',
                        icon: 'dashboard_dark',
                        link_to: 'base.home.dashboards.lecturer',
                        access_levels: [COORDINATOR_ACCESS_LEVEL, LECTURER_ACCESS_LEVEL],
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
                access_levels: [COORDINATOR_ACCESS_LEVEL, STUDENT_ACCESS_LEVEL],
                items: [
                    {
                        name: 'Dashboard',
                        icon: 'dashboard_dark',
                        link_to: 'base.home.dashboards.student',
                        access_levels: [
                            COORDINATOR_ACCESS_LEVEL,
                            LECTURER_ACCESS_LEVEL,
                            STUDENT_ACCESS_LEVEL
                        ],
                    },
                    {
                        name: 'Progress',
                        icon: 'timeline_dark',
                        link_to: 'base.guild.progress',
                        access_levels: [
                            COORDINATOR_ACCESS_LEVEL,
                            LECTURER_ACCESS_LEVEL,
                            STUDENT_ACCESS_LEVEL
                        ],
                    },
                    {
                        name: 'Feedback',
                        icon: 'feedback_dark',
                        link_to: 'base.guild.rules',
                        access_levels: [
                            COORDINATOR_ACCESS_LEVEL,
                            LECTURER_ACCESS_LEVEL,
                            STUDENT_ACCESS_LEVEL
                        ],
                    },
                    {
                        name: 'Activity',
                        icon: 'list_dark',
                        link_to: 'base.guild.activity',
                        access_levels: [
                            COORDINATOR_ACCESS_LEVEL,
                            LECTURER_ACCESS_LEVEL,
                            STUDENT_ACCESS_LEVEL
                        ],
                    },
                ],
            },
        ];

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        if(self.user.id) {
            if(Global.getLocalSettings().enabled_hotkeys) {
                self.addHotkeys();
            }
        }

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              Broadcasts
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        $scope.$on('user-changed', function() {
            self.access = Global.getAccess();
            if(self.user.id) {
                if(Global.getLocalSettings().enabled_hotkeys) {
                    self.addHotkeys();
                } else {
                    self.removeHotkeys();
                }
            } else {
                self.removeHotkeys();
            }
        });

        $scope.$on('guild-changed', function(event, guild) {
            self.selected_guild = guild;
        });

        $scope.$on('patched-local-settings', function() {
            if(Global.getLocalSettings().enabled_hotkeys) {
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
                .add({
                    combo: 'r',
                    description: 'Goto rules',
                    callback: function() {
                        self.changeState('base.rules.overview');
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
                        self.changeState('base.assessments.overview');
                    }
                })
                .add({
                    combo: 's',
                    description: 'Goto stimulance',
                    callback: function() {
                        self.changeState('base.stimulance.overview');
                    }
                })
                .add({
                    combo: 'd',
                    description: 'Goto dashboard',
                    callback: function() {
                        self.changeState('base.home.dashboards.lecturer');
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
                    combo: 'f',
                    description: 'Goto feedback',
                    callback: function() {
                        self.changeState('base.guild.rules');
                    }
                })
                .add({
                    combo: 'd',
                    description: 'Goto dashboard',
                    callback: function() {
                        self.changeState('base.home.dashboards.student');
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
            ; // End of hotkeys
        }

        function removeHotkeys() {
            var alphabeth = 'abcdefghijklmnopqrstuvwxyz';
            _.each(alphabeth, function(letter) {
                hotkeys.del(letter);
            });
        }

    }

}());
