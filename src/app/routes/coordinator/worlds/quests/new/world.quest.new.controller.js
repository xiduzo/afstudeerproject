(function () {
    'use strict';

    angular
        .module('cmd.worlds')
        .controller('WorldsQuestsNewController', WorldsQuestsNewController);

    /** @ngInject */
    function WorldsQuestsNewController(
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
        self.makeSpiderChart = makeSpiderChart;
        self.addQuest = addQuest;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.worldUuid = $stateParams.worldUuid;
        self.world = [];
        self.formInput = {
            name: '',
            description: '',
            experience: null
        };
        self.skills = {
            interaction_design: 0,
            visual_interface_design: 0,
            frontend_development: 0,
            content_management: 0,
            project_management: 0
        };

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        World.getWorld($stateParams.worldUuid)
            .then(function(response) {
                self.world = response;
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
                    self.skills.interaction_design,
                    self.skills.visual_interface_design,
                    self.skills.frontend_development,
                    self.skills.content_management,
                    self.skills.project_management
                ],
                color: '#FFCC00',
                pointPlacement: 'on'
            };

            var credits = {
                text: 'Skill requirements for ' + (self.formInput.name ? self.formInput.name : 'unknown quest'),
                href: ''
            };

            Spiderchart.createChart('spiderChart', '', 400, 400, 65, [scores], true, false, credits);

        }

        function addQuest() {
            var quest = {
                name:        self.formInput.name,
                experience:  self.formInput.experience,
                description: self.formInput.description,
                skills: {
                    interaction_design:      self.skills.interaction_design,
                    visual_interface_design: self.skills.visual_interface_design,
                    frontend_development:    self.skills.frontend_development,
                    content_management:      self.skills.content_management,
                    project_management:      self.skills.project_management
                }
            };

            Quest.addQuest(quest, self.world.url)
                .then(function(response) {
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Quest ' + response.name + ' added to ' + self.world.name)
                        .position('bottom right')
                        .hideDelay(3000)
                    );
                    $state.go('base.worlds.settings', {"worldUuid" : self.world.id});
                }, function() {
                    // Err
                });
        }

        // Initiate the first chart
        self.makeSpiderChart();

    }

}());
