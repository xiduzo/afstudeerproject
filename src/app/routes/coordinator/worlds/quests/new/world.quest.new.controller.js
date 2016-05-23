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
        $timeout,
        Global,
        World,
        Quest,
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
            experience: 0
        };
        self.quests = [];
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

        Quest.getQuests($stateParams.worldUuid)
            .then(function(response) {
                self.quests= response;
            }, function() {
                // Err`
            });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function makeSpiderChart() {
            $('#spiderChart').highcharts({
                chart: {
                    polar: true,
                    type: 'area',
                    spacingBottom: 10,
                    spacingTop: 10,
                    spacingLeft: 10,
                    spacingRight: 10,
                    width: 400,
                    height: 400,
                },

                title: {
                    text: 'Quest skill level'
                },

                exporting: {
                    // Only show the exporting button when you have a higher access level than the student
                    enabled: Global.getAccess() > 1 ? true : false,
                    backgroundColor: 'rgba(255, 255, 255, 0)'
                },

                pane: {
                    size: '65%'
                },

                xAxis: {
                    categories: [
                        'Interaction Design',
                        'Visual Interface Design',
                        'Frontend Development',
                        'Content management',
                        'Project management'
                    ],
                    tickmarkPlacement: 'on',
                    lineWidth: 0,
                },

                yAxis: {
                    gridLineInterpolation: 'polar',
                    lineWidth: 0,
                    min: 0,
                    max: 100,
                    tickInterval : 100 / 4
                },

                tooltip: {
                    shared: true,
                    pointFormat: '{series.name}: <strong>{point.y:,.0f}</strong> <br/>'
                },

                legend: {
                   enabled: false
                },

                plotOptions: {
                    series: {
                        animation: false
                    }
                },

                series: [
                    {
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
                    }
                ],

                credits: {
                    text: 'Skill requirements for ' + (self.formInput.name ? self.formInput.name : 'unknown quest'),
                    href: ''
                }

            });
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

            Quest.addQuest(quest, self.world.uuid)
                .then(function(response) {
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Quest ' + response.name + ' added to ' + self.world.name)
                        .position('bottom right')
                        .hideDelay(3000)
                    );
                    $state.go('base.worlds.settings', {"worldUuid" : self.world.uuid});
                }, function() {
                    // Err
                });
        }

        // Initiate the first chart
        self.makeSpiderChart();

    }

}());
