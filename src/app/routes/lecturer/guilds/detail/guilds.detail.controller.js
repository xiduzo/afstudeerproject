(function () {
    'use strict';

    angular
        .module('cmd.guilds')
        .controller('GuildDetailController', GuildDetailController);

    /** @ngInject */
    function GuildDetailController(
        $stateParams,
        $mdToast,
        $state,
        Guild,
        Global,
        World,
        LECTURER_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < LECTURER_ACCESS_LEVEL) {
            Global.notAllowed();
            return;
        }

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.patchQuestStatus = patchQuestStatus;
        self.makeObjectivesGraph = makeObjectivesGraph;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.guild = [];
        self.colors = ['#e67e22', '#3498db', '#16a085', '#34495e'];

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getGuild($stateParams.guildUuid)
            .then(function(response) {
                if(!response) {
                    GLobal.simpleToast('Group ' + $stateParams.guildUuid + ' does not exist');
                    $state.go('base.guilds.overview');
                }

                self.guild = response;
                console.log(self.guild);
                self.makeObjectivesGraph(response.objectives);
                // response.members = [];
                //
                // self.guild = response;
                //
                // Guild.getGuildMembers($stateParams.guildUuid)
                //     .then(function(response) {
                //         self.guild.members = response;
                //     }, function() {
                //         // Err
                //     });

            }, function() {
                // Err
            });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function patchQuestStatus(quest) {
            Guild.patchQuestStatus(quest)
            .then(function(response) {
                if(response.completed) {
                    Global.simpleToast('Asignment marked as completed');
                } else {
                    Global.simpleToast('Asignment marked as uncompleted');
                }
            }, function(error) {
                // Err patch quest completion status
            });
        }

        function makeObjectivesGraph(objectives) {
            console.log(objectives);
            var tempData = [
                {
                    by: 'sander',

                }
            ];
                $('#completed__tasks').highcharts({
                    chart: {
                        type: 'column'
                    },
                    title: {
                        text: 'Completed tasks'
                    },
                    xAxis: {
                        categories: [
                            'Week 1',
                            '02/09',
                            '03/09',
                            '04/09',
                            '05/09',
                            '06/09',
                            'Week 2',
                            '08/09',
                            '09/09',
                            '11/09',
                            '12/09',
                            '13/09',
                            'Week 3',
                            '15/09',
                            '16/09',
                            '17/09',
                            '18/09',
                            '19/09',
                            'Week 4',
                            '20/09',
                            '21/09',
                            '22/09',
                            '23/09',
                            '24/09',
                            'Week 5',
                            '26/09',
                            '27/09',
                            '28/09',
                            '29/09',
                            '30/09',
                            'Week 6',
                            '02/10',
                            '03/10',
                            '04/10',
                            '05/10',
                            '06/10',
                            'Week 7',
                            '08/10',
                            '09/10',
                            '10/10',
                            '11/10',
                            '12/10',
                            '13/10',
                        ]
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Total fruit consumption'
                        },
                        stackLabels: {
                            enabled: true,
                            style: {
                                fontWeight: 'bold',
                                color: 'gray'
                            }
                        }
                    },
                    legend: {
                        align: 'right',
                        x: -30,
                        verticalAlign: 'top',
                        y: 25,
                        floating: true,
                        backgroundColor: 'white',
                        borderColor: '#CCC',
                        borderWidth: 1,
                        shadow: false
                    },
                    tooltip: {
                        headerFormat: '<b>{point.x}</b><br/>',
                        pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
                    },
                    plotOptions: {
                        column: {
                            stacking: 'normal',
                            dataLabels: {
                                enabled: true,
                                color: 'white',
                                style: {
                                    textShadow: '0 0 3px black'
                                }
                            },
                            events: {
                                click: function(event) {
                                    console.log(event);
                                }
                            }
                        }
                    },
                    series: [
                        {
                            name: 'Nicolas Burton',
                            color: '#e67e22',
                            data: [
                                null,
                                1,
                                null,
                                2,
                                2,
                                3,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                1,
                                null,
                                1,
                                2,
                                1,
                                null,
                                null,
                                null,
                                null,
                                null,
                                4,
                                2,
                                2,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                2,
                                4,
                                3,
                                null,
                                null,
                                4,
                                3,
                                null,
                                null,
                            ]
                        },
                        {
                            name: 'Carol Armstrong',
                            color: '#3498db',
                            data: [
                                1,
                                2,
                                2,
                                4,
                                null,
                                null,
                                null,
                                null,
                                null,
                                1,
                                1,
                                null,
                                null,
                                null,
                                null,
                                null,
                                2,
                                1,
                                null,
                                null,
                                null,
                                1,
                                3,
                                5,
                                null,
                                null,
                                null,
                                3,
                                3,
                                3,
                                null,
                                null,
                                null,
                                null,
                                2,
                                3,
                                1,
                                null,
                                null,
                                4,
                                3,
                                null,
                            ]
                        },
                        {
                            name: 'Pablo Escabar',
                            color: '#16a085',
                            data: [
                                1,
                                2,
                                null,
                                null,
                                3,
                                3,
                                1,
                                null,
                                null,
                                null,
                                null,
                                null,
                                1,
                                2,
                                1,
                                null,
                                null,
                                null,
                                null,
                                4,
                                4,
                                2,
                                4,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                1,
                                1,
                                1,
                                null,
                                null,
                                1,
                                null,
                                null,
                                3,
                                3,
                                2,
                                3,
                            ]
                        },
                        {
                            name: 'Don Pablo',
                            color: '#34495e',
                            data: [
                                1,
                                null,
                                null,
                                3,
                                2,
                                null,
                                null,
                                null,
                                1,
                                3,
                                3,
                                5,
                                3,
                                1,
                                null,
                                null,
                                null,
                                null,
                                2,
                                1,
                                2,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                3,
                                3,
                                6,
                                1,
                                null,
                                null,
                                null,
                                null,
                                null,
                                1,
                                2,
                                2,
                                1,
                                1,
                                1,
                            ]
                        }
                    ]
                });

                $('#completed__tasks__explained').highcharts({
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: 'Completion by user'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: 'black'
                        }
                    }
                }
            },
            series: [{
                name: 'Brands',
                data: [
                    { name: 'Nicolas Burton', y: 26, 'color': '#e67e22' },
                    { name: 'Carol Armstrong', y: 35, 'color': '#3498db' },
                    { name: 'Pablo Escabar', y: 21, 'color': '#16a085' },
                    { name: 'Don Pablo', y: 28, 'color': '#34495e' },
                ]
            }]
        });
        }


    }

}());
