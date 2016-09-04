(function () {
    'use strict';

    angular
        .module('cmd.worlds')
        .controller('WorldsSettingsController', WorldsSettingsController);

    /** @ngInject */
    function WorldsSettingsController(
        $mdDialog,
        $mdToast,
        $state,
        $stateParams,
        Global,
        Quest,
        World,
        COORDINATOR_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < COORDINATOR_ACCESS_LEVEL) {
            Global.notAllowed();
            return;
        }

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.deleteWorld = deleteWorld;
        self.changeWorldName = changeWorldName;
        self.deleteQuest = deleteQuest;
        self.toggleQuest = toggleQuest;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.world = [];

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        World.getWorld($stateParams.worldUuid)
            .then(function(response) {
                if(response.status === 404) {
                    Global.simpleToast('Class ' + $stateParams.worldUuid + ' does not exist');
                    $state.go('base.guilds.overview');
                }

                self.world = response;

                _.each(self.world.quests, function(quest) {
                    Quest.getGuildQuests(quest.id)
                    .then(function(response) {
                        quest.total_guilds_conquering_quest = 0;
                        quest.total_guilds_finished_quest = 0;
                        quest.completion_percentage = 0;
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

            }, function() {
                // Err
            });


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function deleteWorld(event) {
            var dialog = $mdDialog.confirm()
                        .title('Are you sure you want to delete this Class?')
                        .textContent('Please consider your answer, this action can not be undone.')
                        .clickOutsideToClose(true)
                        .ariaLabel('Delete world')
                        .targetEvent(event)
                        .ok('Yes, I accept the consequences')
                        .cancel('No, take me back!');

            $mdDialog.show(dialog).then(function() {
                World.deleteWorld(self.world.id)
                    .then(function(response) {
                        Global.simpleToast('Class ' + self.world.name + ' has been deleted');
                        $state.go('base.worlds.overview');
                    }, function() {
                        // Err
                    });
            }, function() {
                // No
            });
        }

        function changeWorldName(event) {
            var dialog = $mdDialog.prompt()
                        .title('Change the world name of "' +self.world.name+ '"')
                        .textContent('How would you like to name this world?')
                        .clickOutsideToClose(true)
                        .placeholder('World name')
                        .ariaLabel('World name')
                        .targetEvent(event)
                        .ok('Change world name')
                        .cancel('Cancel');

            $mdDialog.show(dialog)
                .then(function(result) {
                    // Ok

                    // Checks for thw world name
                    if(!result) {
                        Global.simpleToast('Please enter a name');
                        return;
                    }

                    World.changeWorldName(result, self.world.id)
                        .then(function(response) {
                            self.world.name = result;
                            Global.simpleToast('Name change to ' + result);
                        }, function() {
                            // Err
                        });

                }, function() {
                    // Cancel
                });
        }

        function deleteQuest(event, quest) {
            var dialog = $mdDialog.confirm()
                        .title('Are you sure you want to delete this assignment?')
                        .textContent('Please consider your answer, this action can not be undone.')
                        .clickOutsideToClose(true)
                        .ariaLabel('Delete quest')
                        .targetEvent(event)
                        .ok('Yes, I accept the consequences')
                        .cancel('No, take me back!');

            $mdDialog.show(dialog).then(function() {
                Quest.deleteQuest(quest.id)
                    .then(function(response) {
                        if(response.status >= 400) {
                            Global.statusCode(response);
                            return;
                        }

                        Global.simpleToast(quest.name + ' got removed from ' + self.world.name);
                        // Remove the quest in the frontend
                        self.world.quests.splice(self.world.quests.indexOf(quest), 1);

                    }, function() {
                        // Err
                    });
            }, function() {
                // No
            });
        }

        function toggleQuest(quest) {
            Quest.toggleQuest(quest.id, quest.active)
                .then(function(response) {
                    Global.simpleToast('Assignment ' + (quest.active ? 'activated' : 'deactivated'));
                }, function() {
                    // Err
                });
        }

    }

}());
