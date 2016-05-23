(function () {
    'use strict';

    angular
        .module('cmd.worlds')
        .controller('WorldsQuestsEditController', WorldsQuestsEditController);

    /** @ngInject */
    function WorldsQuestsEditController(
        $mdToast,
        $state,
        $stateParams,
        Global,
        Quest,
        Spiderchart,
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
        self.makeSpiderChart = makeSpiderChart;
        self.patchQuest = patchQuest;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
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
            var quest = {
                uuid:        self.quest.uuid,
                name:        self.quest.name,
                experience:  self.quest.experience,
                description: self.quest.description,
                skills: {
                    interaction_design:      self.quest.interaction_design,
                    visual_interface_design: self.quest.visual_interface_design,
                    frontend_development:    self.quest.frontend_development,
                    content_management:      self.quest.content_management,
                    project_management:      self.quest.project_management
                }
            };

            Quest.patchQuest(quest, self.worldUuid)
                .then(function(response) {
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('The quest has been updated')
                        .position('bottom right')
                        .hideDelay(3000)
                    );
                    $state.go('base.worlds.settings', {"worldUuid" : self.worldUuid});
                }, function() {
                    // Err
                });
        }

    }

}());
