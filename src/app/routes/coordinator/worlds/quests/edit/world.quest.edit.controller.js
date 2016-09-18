(function () {
    'use strict';

    angular
        .module('cmd.worlds')
        .controller('WorldsQuestsEditController', WorldsQuestsEditController);

    /** @ngInject */
    function WorldsQuestsEditController(
        $mdDialog,
        $mdToast,
        $state,
        $stateParams,
        Global,
        Notifications,
        Quest,
        Spiderchart,
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
        self.makeSpiderChart = makeSpiderChart;
        self.patchQuest = patchQuest;
        self.addObjective = addObjective;
        self.removeObjective = removeObjective;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.objectives = [];
        self.objectives_to_remove = [];
        self.objectives_to_add = [];
        self.questUuid = $stateParams.questUuid;
        self.worldUuid = $stateParams.worldUuid;
        self.quest = {
            content_management: 0,
            frontend_development: 0,
            interaction_design: 0,
            project_management: 0,
            visual_interface_design: 0,
            experience: 0
        };

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Quest.getQuest($stateParams.questUuid)
            .then(function(response) {
                if(!response) {
                    return;
                }

                response.experience = parseInt(response.experience);
                response.content_management = parseInt(response.content_management);
                response.frontend_development = parseInt(response.frontend_development);
                response.interaction_design = parseInt(response.interaction_design);
                response.project_management = parseInt(response.project_management);
                response.visual_interface_design = parseInt(response.visual_interface_design);
                self.quest = response;
                // Initiate the first chart
                self.makeSpiderChart();

                self.objectives = response.objectives;

            }, function() {
                // Err
            });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function makeSpiderChart() {
            var scores = {
                name: 'Level',
                data: [
                    self.quest.interaction_design,
                    self.quest.visual_interface_design,
                    self.quest.frontend_development,
                    self.quest.content_management,
                    self.quest.project_management
                ],
                color: '#FFCC00',
                pointPlacement: 'on'
            };

            var credits = {
                text: 'Skill requirements for ' + (self.quest.name ? self.quest.name : 'unknown quest'),
                href: ''
            };

            Spiderchart.createChart('spiderChart', '', 400, 400, 65, [scores], true, false, credits);
        }

        function patchQuest() {
            Notifications.simpleToast('Patching assignment');
            self.quest.skills = {
                interaction_design:      self.quest.interaction_design,
                visual_interface_design: self.quest.visual_interface_design,
                frontend_development:    self.quest.frontend_development,
                content_management:      self.quest.content_management,
                project_management:      self.quest.project_management
            };

            _.each(self.objectives_to_add, function(objective) {
                Quest.addObjective(self.quest.url, objective);
            });

            _.each(self.objectives_to_remove, function(objective) {
                Quest.removeObjective(objective.id);
            });
            Quest.patchQuest(self.quest)
                .then(function(response) {
                    Notifications.simpleToast('The assignment has been updated');
                    $state.go('base.worlds.settings', {"worldUuid" : self.worldUuid});
                }, function() {
                    // Err
                });
        }

        function addObjective() {
            $mdDialog.show({
                controller: 'addQuestObjectiveController',
                controllerAs: 'addQuestObjectiveCtrl',
                templateUrl: 'app/routes/coordinator/worlds/quests/new/objectives/objectives.html',
                targetEvent: event,
                clickOutsideToClose: true,
                locals: {
                    title: 'Add objective to ' + self.quest.name,
                    about: 'Assignment objective',
                }
            })
                .then(function(response) {
                    if(!response || !response.name || !response.objective || !response.points) {
                        return;
                    }

                    response.editing = false;
                    self.objectives_to_add.push(response);
                    self.objectives.push(response);

                }, function() {
                    // Err
                });
        }

        function removeObjective(objective) {
            self.objectives_to_remove.push(objective);
            self.objectives.splice(self.objectives.indexOf(objective), 1);
        }

    }

}());
