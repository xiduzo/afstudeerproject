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

        self.main_navigation = [
            {
                subgroup: 'coordinator',
                access_levels: [COORDINATOR_ACCESS_LEVEL],
                items: [
                    // didnt delete route for when we think of something interesting to put there
                    // {
                    //     name: 'Dashboard',
                    //     icon: 'dashboard_dark',
                    //     link_to: 'base.home.dashboards.coordinator',
                    //     access_levels: [COORDINATOR_ACCESS_LEVEL],
                    // },
                    {
                        name: 'Klassen',
                        icon: 'world_dark',
                        link_to: 'base.worlds.overview',
                        access_levels: [COORDINATOR_ACCESS_LEVEL],
                    },
                    {
                        name: 'Afspraken',
                        icon: 'rules_dark',
                        link_to: 'base.rules.overview',
                        access_levels: [COORDINATOR_ACCESS_LEVEL],
                    },
                    {
                        name: 'Docenten',
                        icon: 'person_dark',
                        link_to: 'base.lecturers',
                        access_levels: [COORDINATOR_ACCESS_LEVEL],
                    },
                    {
                        name: 'Studenten',
                        icon: 'person_dark',
                        link_to: 'base.students',
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
                        name: 'Team',
                        icon: 'guild_dark',
                        link_to: 'base.guilds.overview',
                        access_levels: [COORDINATOR_ACCESS_LEVEL, LECTURER_ACCESS_LEVEL],
                    },

                ],
            },
            {
                subgroup: 'student',
                access_levels: [STUDENT_ACCESS_LEVEL],
                items: [
                    {
                        name: 'Dashboard',
                        icon: 'dashboard_dark',
                        link_to: 'base.home.dashboards.student',
                        access_levels: [STUDENT_ACCESS_LEVEL],
                    },
                    {
                        name: 'Workload',
                        icon: 'pie_dark',
                        link_to: 'base.guild.workload',
                        access_levels: [STUDENT_ACCESS_LEVEL],
                    },
                    {
                        name: 'Feedback',
                        icon: 'feedback_dark',
                        link_to: 'base.guild.rules',
                        access_levels: [STUDENT_ACCESS_LEVEL],
                    },
                    {
                        name: 'Activity log',
                        icon: 'list_dark',
                        link_to: 'base.guild.activity',
                        access_levels: [STUDENT_ACCESS_LEVEL],
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
        $scope.$on('new-user-set', function() {
            self.access = Global.getAccess();
            self.user = Global.getUser();
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

        $scope.$on('user-logged-out', function() {
            self.access = Global.getAccess();
            self.removeHotkeys();
        });

        $scope.$on('patched-local-settings', function() {
            if(Global.getLocalSettings().enabled_hotkeys) {
                self.addHotkeys();
            } else {
                self.removeHotkeys();
            }
        });

        $scope.$on('$stateChangeSuccess', function ($event, toState, toParams, fromState) {
            self.active_menu_item = toState.name;
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
            self.toggleNavigation();
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
                  combo: 'd',
                  description: 'Goto dashboard',
                  callback: function() {
                    self.changeState('base.home.dashboards.student');
                  }
                })
                .add({
                    combo: 'w',
                    description: 'Goto workload',
                    callback: function() {
                        self.changeState('base.guild.workload');
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
                    combo: 'a',
                    description: 'Goto activity log',
                    callback: function() {
                        self.changeState('base.guild.activity');
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
