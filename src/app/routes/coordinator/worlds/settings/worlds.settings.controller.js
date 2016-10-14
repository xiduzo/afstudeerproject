(function () {
    'use strict';

    angular
        .module('cmd.worlds')
        .controller('WorldsSettingsController', WorldsSettingsController);

    /** @ngInject */
    function WorldsSettingsController(
        $mdDialog,
        $state,
        $stateParams,
        $scope,
        hotkeys,
        Global,
        Notifications,
        Quest,
        World,
        COORDINATOR_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < COORDINATOR_ACCESS_LEVEL) {
            Global.notAllowed();
            return;
        }

        Global.setRouteTitle('Loading page...');

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.deleteWorld = deleteWorld;
        self.changeWorldName = changeWorldName;
        self.deleteQuest = deleteQuest;
        self.patchQuest = patchQuest;
        self.addRule = addRule;
        self.deleteRule = deleteRule;
        self.addHotkeys = addHotkeys;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.world = [];
        self.loading_page = true;
        self.rule_types = [
            { type: 1, name: 'Houding', icon: 'work_dark', },
            { type: 2, name: 'Functioneren binnen het team', icon: 'group_work_dark', },
            { type: 3, name: 'Kennisontwikkeling', icon: 'lightbulb_dark', },
            { type: 4, name: 'Verantwoording', icon: 'description_dark', },
        ];

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        World.getWorld($stateParams.worldUuid)
            .then(function(response) {
                if(response.status === 404) {
                    Notifications.simpleToast('Class ' + $stateParams.worldUuid + ' does not exist');
                    $state.go('base.guilds.overview');
                }

                self.world = response;

                Global.setRouteTitle('Class settings of: ' + self.world.name);

                _.each(self.world.quests, function(quest) {
                    quest.total_guilds_conquering_quest = 0;
                    quest.total_guilds_finished_quest = 0;
                    quest.completion_percentage = 0;

                    Quest.getGuildQuests(quest.id)
                    .then(function(response) {

                        _.each(response, function(guild_quest) {
                            quest.total_guilds_conquering_quest++;
                            if(guild_quest.completed) {
                                quest.total_guilds_finished_quest++;
                            }
                        });
                        if(quest.total_guilds_conquering_quest) {
                            quest.completion_percentage = quest.total_guilds_finished_quest * 100 / quest.total_guilds_conquering_quest;
                        }

                    }, function(error) {
                        // Err get guild quests
                    });
                });

                self.addHotkeys();
                self.loading_page = false;

            }, function() {
                // Err
            });


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function deleteWorld(event) {
            Notifications.confirmation(
                'Are you sure you want to delete this class?',
                'Please consider your answer, this action can not be undone.',
                'Delete class',
                event
            )
            .then(function() {
                World.deleteWorld(self.world.id)
                    .then(function(response) {
                        Notifications.simpleToast('Class ' + self.world.name + ' has been deleted');
                        $state.go('base.worlds.overview');
                    }, function() {
                        // Err
                    });
            }, function() {
                // No
            });
        }

        function changeWorldName(event) {
            Notifications.prompt(
                'Change the class name of \'' +self.world.name+ '\'',
                'How would you like to name this class?',
                'Class name',
                event
            )
            .then(function(result) {
                if(!result) {
                    return Notifications.simpleToast('Please enter a name');
                }

                World.changeWorldName(result, self.world.id)
                .then(function(response) {
                    self.world.name = result;
                    Notifications.simpleToast('Name change to ' + result);
                }, function() {
                    // Err
                });

            }, function() {
                // Cancel
            });
        }

        function deleteQuest(event, quest) {
            Notifications.confirmation(
                'Are you sure you want to delete this assessment?',
                'Please consider your answer, this action can not be undone.',
                'Delete quest',
                event
            )
            .then(function() {
                Quest.deleteQuest(quest.id)
                .then(function(response) {
                    if(response.status >= 400) {
                        Global.statusCode(response);
                        return;
                    }

                    Notifications.simpleToast(quest.name + ' got removed from ' + self.world.name);
                    // Remove the quest in the frontend
                    self.world.quests.splice(_.indexOf(self.world.quests, quest), 1);

                }, function() {
                    // Err delete quest
                });
            }, function() {
                // No
            });
        }

        function patchQuest(quest) {
            Quest.patchQuestToggles(quest)
            .then(function(response) {
                Notifications.simpleToast('Patched assessment.');
            }, function() {
                // Err toggle quest
            });
        }

        function addRule() {
            $mdDialog.show({
                controller: 'addRuleController',
                controllerAs: 'addRuleCtrl',
                templateUrl: 'app/routes/coordinator/worlds/settings/rules/rules.html',
                targetEvent: event,
                clickOutsideToClose: true,
                locals: {
                    title: 'Add rule for ' + self.world.name,
                    about: 'rule',
                }
            })
            .then(function(response) {
                if(!response ||
                    !response.rule ||
                    !response.rule_type ||
                    !response.points) {
                    return Notifications.simpleToast('Fill in all the fields to add an rule');
                }

                // Add rule to the system
                World.addRule(self.world.url, response)
                .then(function(response) {
                    Notifications.simpleToast('Rule \''+response.rule+'\' added');
                    self.world.rules.push(response);
                })
                .catch(function(error) {
                    // err add rule
                });


            }, function() {
                // Err dialog
            });
        }

        function deleteRule(event, rule) {
            Notifications.confirmation(
                'Are you sure you want to delete this rule?',
                'Please consider your answer, this action can not be undone.',
                'Delete quest',
                event
            )
            .then(function() {
                World.removeRule(rule.id)
                .then(function(response) {
                    Notifications.simpleToast(rule.rule + ' got removed from ' + self.world.name);
                    // Remove the quest in the frontend
                    self.world.rules.splice(_.indexOf(self.world.rules, rule), 1);

                }, function() {
                    // Err delete rule
                });
            }, function() {
                // No
            });
        }

        function addHotkeys() {
            hotkeys.bindTo($scope)
            .add({
                combo: 'shift+c',
                description: 'Change class name',
                callback: function(event) {
                    event.preventDefault();
                    self.changeWorldName();
                }
            })
            .add({
                combo: 'shift+a',
                description: 'Add assessment',
                callback: function(event) {
                    event.preventDefault();
                    $state.go('base.worlds.quests.new', {worldUuid: self.world.id});
                }
            })
            .add({
                combo: 'shift+r',
                description: 'Add rule',
                callback: function(event) {
                    event.preventDefault();
                    self.addRule();
                }
            })
            .add({
                combo: 'shift+d',
                description: 'Delete ' + self.world.name,
                callback: function(event) {
                    event.preventDefault();
                    self.deleteWorld();
                }
            })

            ; // End of hotkeys
        }

    }

}());
