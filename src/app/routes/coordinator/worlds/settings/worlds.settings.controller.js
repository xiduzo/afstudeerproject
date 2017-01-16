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

        Global.setRouteTitle('Class settings');
        Global.setRouteBackRoute('base.worlds.overview');

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.deleteWorld = deleteWorld;
        self.changeWorldName = changeWorldName;
        self.deleteQuest = deleteQuest;
        self.patchQuest = patchQuest;
        self.addHotkeys = addHotkeys;
        self.patchWorldSettings = patchWorldSettings;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.world = [];
        self.loading_page = true;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        World.getWorld($stateParams.worldUuid)
            .then(function(response) {
                if(response.status === 404) {
                    Notifications.simpleToast('Class ' + $stateParams.worldUuid + ' does not exist');
                    $state.go('base.guilds.overview');
                }

                response.start = new Date(moment(response.start));
                self.world = response;

                Global.setRouteTitle('Class settings', self.world.name);

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

                if(Global.getLocalSettings().enabled_hotkeys) {
                    self.addHotkeys();
                }
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

        function patchWorldSettings() {
            World.patchWorldSettings(self.world)
            .then(function(response) {
                Notifications.simpleToast('Class settings updated');
            })
            .catch(function(error) {
                console.log(error);
            });
        }

    }

}());
