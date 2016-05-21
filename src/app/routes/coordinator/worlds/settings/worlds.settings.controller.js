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
        self.deleteWorld = deleteWorld;
        self.makeSpiderChart = makeSpiderChart;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        World.getWorld($stateParams.worldUuid)
            .then(function(response) {
                if(!response) {
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('World ' + $stateParams.worldUuid + ' does not exist')
                        .position('bottom right')
                        .hideDelay(3000)
                    );
                    $state.go('base.guilds.overview');
                }
                response.quests = [];
                self.world = response;
                Quest.getQuests(response.uuid)
                    .then(function(response) {
                        _.each(response, function(quest) {
                            self.world.quests.push(quest);
                            setTimeout(function () {
                                self.makeSpiderChart(quest);
                            }, 100);
                        });
                        // _.each(self.world.quests, function(quest) {
                        // });

                    }, function() {
                        // Err
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
                World.deleteWorld(self.world.uuid)
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

        function makeSpiderChart(quest) {
            $('#'+quest.uuid).highcharts({
                chart: {
                    polar: true,
                    type: 'area',
                    spacingBottom: 10,
                    spacingTop: 25,
                    spacingLeft: 10,
                    spacingRight: 10,
                    width: 325,
                    height: 225,
                },

                title: {
                    text: ''
                },

                exporting: {
                    // Only show the exporting button when you have a higher access level than the student
                    enabled: false
                },

                pane: {
                    size: '80%'
                },

                xAxis: {
                    categories: [
                        'Interaction design',
                        'Visual interface design',
                        'Frontend development',
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

                series: [
                    {
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
                    }
                ],

                credits: {
                    enabled: false
                }

            });
        }

    }

}());
