(function () {
    'use strict';

    angular
        .module('cmd.worlds')
        .controller('WorldsQuestsNewController', WorldsQuestsNewController);

    /** @ngInject */
    function WorldsQuestsNewController(
        $timeout,
        $stateParams,
        Global,
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

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.worldUuid = $stateParams.worldUuid;
        self.world = [];
        self.formInput = {
            name: '',
            experience: 0
        };

        self.skills = {
            interaction_design: {
                level: 0,
                label: 'Interaction Design'
            },
            visual_interface_design: {
                level: 0,
                label: 'Visual Interface Design'
            },
            frontend_development: {
                level: 0,
                label: 'Frontend Development'
            },
            content_management: {
                level: 0,
                label: 'Content management'
            },
            project_management: {
                level: 0,
                label: 'Project management'
            }

        };

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        World.getWorld($stateParams.worldUuid)
            .then(function(response) {

            }, function() {
                // Err
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
                        self.skills.interaction_design.label,
                        self.skills.visual_interface_design.label,
                        self.skills.frontend_development.label,
                        self.skills.content_management.label,
                        self.skills.project_management.label
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
                            self.skills.interaction_design.level,
                            self.skills.visual_interface_design.level,
                            self.skills.frontend_development.level,
                            self.skills.content_management.level,
                            self.skills.project_management.level
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

        // Initiate the first chart
        self.makeSpiderChart();


    }

}());
