(function () {
    'use strict';

    angular
        .module('cmd.account')
        .controller('AccountDetailController', AccountDetailController);

    /** @ngInject */
    function AccountDetailController(
        Global,
        Guild,
        Quest,
        World,
        Spiderchart,
        STUDENT_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < STUDENT_ACCESS_LEVEL) {
            Global.notAllowed();
            return;
        }

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.createSpiderChart = createSpiderChart;
        self.createCMDChart = createCMDChart;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getUserGuilds(self.user.id)
        .then(function(response) {
            var my_scores = {
                interaction_design: 0,
                visual_interface_design: 0,
                frontend_development: 0,
                content_management: 0,
                project_management: 0,
            };
            var average = {
                interaction_design: 0,
                visual_interface_design: 0,
                frontend_development: 0,
                content_management: 0,
                project_management: 0,
            };
            var total_completed_quests = 0;
            var total_completed_quests_average = 0;
            self.user.worlds = [];

            // Calculate my chart
            _.each(response.guilds, function(guild) {
                self.user.worlds.push(guild.guild.world);
                _.each(guild.guild.quests, function(quest) {
                    if(quest.completed) {
                        total_completed_quests++;
                        my_scores.interaction_design += quest.quest.interaction_design;
                        my_scores.visual_interface_design += quest.quest.visual_interface_design;
                        my_scores.frontend_development += quest.quest.frontend_development;
                        my_scores.content_management += quest.quest.content_management;
                        my_scores.project_management += quest.quest.project_management;
                    }
                });
            });
            my_scores = _.map(my_scores, function(score) {
                return score / total_completed_quests;
            });
            my_scores = {
                name: 'My score',
                data: my_scores,
                color: '#FFCC00',
                fillOpacity: 1,
                pointPlacement: 'on',
                marker: { radius: 0 }
            };

            // console.log(self.user.worlds);
            self.user.worlds = _.groupBy(self.user.worlds, function(world) {
                return world.id;
            });

            // TODO
            // Fix good average calculations
            // Calculate the average
            _.each(self.user.worlds, function(world) {
                World.getWorld(world[0].id)
                .then(function(response) {
                    _.each(response.guilds, function(guild) {
                        // console.log(guild);
                        _.each(guild.quests, function(quest) {
                            if(quest.completed) {
                                total_completed_quests_average++;
                                average.interaction_design += quest.quest.interaction_design;
                                average.visual_interface_design += quest.quest.visual_interface_design;
                                average.frontend_development += quest.quest.frontend_development;
                                average.content_management += quest.quest.content_management;
                                average.project_management += quest.quest.project_management;
                            }
                        });
                    });
                    // // console.log(average, total_completed_quests_average);
                    var tmpAverage = _.map(average, function(score) {
                        return score / total_completed_quests_average;
                    });

                    tmpAverage = {
                        name: 'Average score',
                        data: tmpAverage,
                        lineWidth: 0,
                        color: 'rgb(190, 75, 75)',
                        fillOpacity: 0.5,
                        pointPlacement: 'on',
                        marker: { radius: 0 }
                    };

                    self.createSpiderChart(tmpAverage, my_scores);

                });
            });

        }, function(error) {
            // Error get user guilds
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function createSpiderChart(average, my_scores) {
            Spiderchart.createChart(
                'container',
                '',
                350,
                350,
                65,
                [average, my_scores],
                true,
                true,
                {
                    text: moment().format("DD/MM/YY HH:mm"),
                    href: ''
                }
            );
        }

        self.circle_template = {
            radius: 200,
            steps: 50,
        };

        self.techniek_base = {
            x: self.circle_template.radius * 1.5,
            y: self.circle_template.radius * 2
        };
        self.techniek_circle = [];

        self.interaction_base = {
            x: self.circle_template.radius * 2,
            y: self.circle_template.radius * 2.8
        };
        self.interaction_circle = [];

        self.visual_base = {
            x: self.circle_template.radius * 2.5,
            y: self.circle_template.radius * 2
        };
        self.visual_circle = [];

        for (var i = 0; i < self.circle_template.steps; i++) {
            self.techniek_circle.push([
                self.techniek_base.x + self.circle_template.radius * Math.cos(2 * Math.PI * i / self.circle_template.steps),
                self.techniek_base.y + self.circle_template.radius * Math.sin(2 * Math.PI * i / self.circle_template.steps)
            ]);

            self.interaction_circle.push([
                self.interaction_base.x + self.circle_template.radius * Math.cos(2 * Math.PI * i / self.circle_template.steps),
                self.interaction_base.y + self.circle_template.radius * Math.sin(2 * Math.PI * i / self.circle_template.steps)
            ]);

            self.visual_circle.push([
                self.visual_base.x + self.circle_template.radius * Math.cos(2 * Math.PI * i / self.circle_template.steps),
                self.visual_base.y + self.circle_template.radius * Math.sin(2 * Math.PI * i / self.circle_template.steps)
            ]);
        }

        self.createCMDChart();

        function realignLabels(serie) {

            _.each(serie.points, function (j, point) {
                if (!point.dataLabel) return true;

                var max = serie.yAxis.max,
                labely = point.dataLabel.attr('y'),
                labelx = point.dataLabel.attr('x');

                if (point.y / max < 0.05) {
                    point.dataLabel.attr({
                        y: labely - 20,
                        x: labelx + 5,
                        rotation: 0
                    });
                }
            });
        }


        function createCMDChart() {
            Highcharts.Series.prototype.drawDataLabels = (function (func) {
                return function () {
                    func.apply(this, arguments);
                    if (this.options.dataLabels.enabled || this._hasPointLabels) {
                        realignLabels(this);
                    }
                };
            }(Highcharts.Series.prototype.drawDataLabels));

            $('#testContainer').highcharts({
                chart: {
                    width: self.circle_template.radius * 2.25,
                    height: self.circle_template.radius * 2,
                },
                title: {
                    text: 'My CMD profile'
                },
                xAxis: {
                    max: self.circle_template.radius * 2 * 2,
                    gridLineWidth: 0,
                    title: {
                        enabled: false
                    },
                    labels: {
                        enabled:false
                    },
                    startOnTick: true,
                },
                yAxis: {
                    max: self.circle_template.radius * 2 * 2,
                    gridLineWidth: 0,
                    title: {
                        enabled: false
                    },
                    labels: {
                        enabled:false
                    },
                },
                plotOptions: {
                    polygon: {
                        dataLabels: {
                            inside: true,
                            style: {
                                color: 'contrast',
                                fontSize: 12,
                                fontWeight: 'bold',
                                textShadow: null
                            },
                        }
                    }
                },
                legend: { enabled: false },
                series: [
                    {
                        name: 'Techniek',
                        type: 'polygon',
                        data: self.techniek_circle,
                        color: Highcharts.Color('#ffcc00').setOpacity(0.4).get(),
                        fillOpacity: 0.1,
                        enableMouseTracking: false,
                        // https://css-tricks.com/set-text-on-a-circle/
                        dataLabels: {
                            enabled: true,
                            rotation: 44,
                            x: 20,
                            y: 0,
                            formatter: function() {
                                if(_.indexOf(this.series.data,this.point) == Math.floor(self.circle_template.steps * 0.6)) {
                                    return "TECHIEK";
                                }
                            },
                        }
                    },
                    {
                        name: 'Interaction design',
                        type: 'polygon',
                        data: self.interaction_circle,
                        color: Highcharts.Color('#ffcc00').setOpacity(0.4).get(),
                        enableMouseTracking: false,
                        dataLabels: {
                            enabled: true,
                            x: 35,
                            y: 40,
                            formatter: function() {
                                if(_.indexOf(this.series.data,this.point) == Math.floor(self.circle_template.steps * 0.3)) {
                                    return "INTERACTION DESIGN";
                                }
                            },
                        }
                    },
                    {
                        name: 'Visual design',
                        type: 'polygon',
                        data: self.visual_circle,
                        color: Highcharts.Color('#ffcc00').setOpacity(0.4).get(),
                        enableMouseTracking: false,
                        dataLabels: {
                            enabled: true,
                            rotation: -44,
                            x: -25,
                            y: -5,
                            formatter: function() {
                                if(_.indexOf(this.series.data,this.point) == Math.floor(self.circle_template.steps * 0.9)) {
                                    return "VISUAL DESIGN";
                                }
                            },
                        }
                    },
                ],
                tooltip: {
                headerFormat: '<b>{series.name}</b><br>',
                pointFormat: '{point.x} cm, {point.y} kg'
                }
            });
        }

    }

}());
