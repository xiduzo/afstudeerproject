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
        Spiderchart,
        World,
        COORDINATOR_ACCESS_LEVEL
    ) {

        if(Global.getAccess() !== COORDINATOR_ACCESS_LEVEL) {
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
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('World ' + $stateParams.worldUuid + ' does not exist')
                        .position('bottom right')
                        .hideDelay(3000)
                    );
                    $state.go('base.guilds.overview');
                }

                self.world = response;

                _.each(response.quests, function(quest) {
                    var questScore = {
                        name: 'Level',
                        data: [
                            parseInt(quest.interaction_design),
                            parseInt(quest.visual_interface_design),
                            parseInt(quest.frontend_development),
                            parseInt(quest.content_management),
                            parseInt(quest.project_management)
                        ],
                        color: '#FFCC00',
                        pointPlacement: 'on'
                    };

                    // Add a little time for the HTML to render
                    // Before drawing the chart
                    setTimeout(function () {
                        Spiderchart.createChart(quest.id, '', 350, 250, 80, [questScore], true, true, {enabled: false});
                    }, 100);
                });
            }, function() {
                // Err
            });


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function deleteWorld(event) {
            var dialog = $mdDialog.confirm()
                        .title('Are you sure you want to delete this world?')
                        .textContent('Please consider your answer, this action can not be undone.')
                        .clickOutsideToClose(true)
                        .ariaLabel('Delete world')
                        .targetEvent(event)
                        .ok('Yes, I accept the consequences')
                        .cancel('No, take me back!');

            $mdDialog.show(dialog).then(function() {
                World.deleteWorld(self.world.id)
                    .then(function(response) {
                        $mdToast.show(
                            $mdToast.simple()
                            .textContent('World ' + self.world.name + ' has been deleted')
                            .position('bottom right')
                            .hideDelay(3000)
                        );
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
                        $mdToast.show(
                            $mdToast.simple()
                            .textContent('Please enter a worldname')
                            .position('bottom right')
                            .hideDelay(3000)
                        );
                        return;
                    }

                    World.changeWorldName(result, self.world.id)
                        .then(function(response) {
                            self.world.name = result;
                            $mdToast.show(
                                $mdToast.simple()
                                .textContent('World name change to ' + result)
                                .position('bottom right')
                                .hideDelay(3000)
                            );
                        }, function() {
                            // Err
                        });

                }, function() {
                    // Cancel
                });
        }

        function deleteQuest(event, quest) {
            var dialog = $mdDialog.confirm()
                        .title('Are you sure you want to delete this quest?')
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

                        $mdToast.show(
                            $mdToast.simple()
                            .textContent(quest.name + ' got removed from ' + self.world.name)
                            .position('bottom right')
                            .hideDelay(3000)
                        );

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
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Quest ' + (quest.active ? 'activated' : 'deactivated'))
                        .position('bottom right')
                        .hideDelay(3000)
                    );
                }, function() {
                    // Err
                });
        }

    }

}());
