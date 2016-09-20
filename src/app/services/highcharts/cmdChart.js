(function () {
    'use strict';

    angular
        .module('cmd.services')
        .factory('CMDChart', CMDChart);

    /** @Spiderchart */
    function CMDChart(
        Global
    ) {

        var service = this;

        service.createChart = createChart;

        return service;

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

        function createChart(container, data) {
            Highcharts.Series.prototype.drawDataLabels = (function (func) {
                return function () {
                    func.apply(this, arguments);
                    if (this.options.dataLabels.enabled || this._hasPointLabels) {
                        realignLabels(this);
                    }
                };
            }(Highcharts.Series.prototype.drawDataLabels));

            // When changing the amount of steps, be sure to change
            // the cmd profiles build as well
            // TODO
            // Automate the cmd profiles build.
            var circle_template = {
                radius: 200,
                steps: 125,
            };

            var techniek_base = {
                x: circle_template.radius * 1.5,
                y: circle_template.radius * 2
            };
            var techniek_circle = [];

            var interaction_base = {
                x: circle_template.radius * 2,
                y: circle_template.radius * 2.8
            };
            var interaction_circle = [];

            var visual_base = {
                x: circle_template.radius * 2.5,
                y: circle_template.radius * 2
            };
            var visual_circle = [];

            var i;
            for (i = 0; i < circle_template.steps; i++) {
                techniek_circle.push([
                    techniek_base.x + circle_template.radius * Math.cos(2 * Math.PI * i / circle_template.steps),
                    techniek_base.y + circle_template.radius * Math.sin(2 * Math.PI * i / circle_template.steps)
                ]);

                interaction_circle.push([
                    interaction_base.x + circle_template.radius * Math.cos(2 * Math.PI * i / circle_template.steps),
                    interaction_base.y + circle_template.radius * Math.sin(2 * Math.PI * i / circle_template.steps)
                ]);

                visual_circle.push([
                    visual_base.x + circle_template.radius * Math.cos(2 * Math.PI * i / circle_template.steps),
                    visual_base.y + circle_template.radius * Math.sin(2 * Math.PI * i / circle_template.steps)
                ]);
            }

            // Building the possible CMD profiles, this was a pain in the ass
            var profiles = {
                tech: { active: false, data: [] },
                interaction: { active: false, data: [] },
                visual: { active: false, data: [] },
                unicorn: { active: false, data: [] },
                // Combinations
                tech_interaction: { active: false, data: [] },
                tech_visual: { active: false, data: [] },
                visual_interaction: { active: false, data: [] },
            };

            var treshold = 60;

            if(data.techniek >= treshold && data.interaction >= treshold && data.visual >= treshold) {
                profiles.unicorn.active = true;
            } else {
                if(data.techniek >= treshold && data.interaction >= treshold) {
                    profiles.tech_interaction.active = true;
                } else if(data.techniek >= treshold && data.visual >= treshold) {
                    profiles.tech_visual.active = true;
                } else if(data.interaction >= treshold && data.visual >= treshold) {
                    profiles.visual_interaction.active = true;
                } else {
                    if(data.techniek >= treshold) {
                        profiles.tech.active = true;
                    } else if(data.interaction >= treshold) {
                        profiles.interaction.active = true;
                    } else if(data.visual >= treshold) {
                        profiles.visual.active = true;
                    }
                }
            }

            // Tech profile
            // tech 42 - 104
            // visual 1 - 21
            // interaction 83 - 61
            for(i=41;i<=104; i++) {
                profiles.tech.data.push(techniek_circle[i]);
            }
            for(i = 83; i >= 64; i--) {
                profiles.tech.data.push(visual_circle[i]);
            }
            for(i = 83; i >= 63; i--) {
                profiles.tech.data.push(interaction_circle[i]);
            }

            // Interaction profile
            // interaction 61 - 1
            // visual 21 - 42
            // tech 21 - 42
            for(i = 61; i >= 1; i--) {
                profiles.interaction.data.push(interaction_circle[i]);
            }
            for(i = 21; i <= 42; i++) {
                profiles.interaction.data.push(visual_circle[i]);
            }
            for(i = 21; i <= 42; i++) {
                profiles.interaction.data.push(techniek_circle[i]);
            }

            // Visual profile
            // visual 84 - 21
            // interaction 125 - 104
            // tech 125 - 104
            for(i = 83; i <= 125; i++) {
                profiles.visual.data.push(visual_circle[i]);
            }
            for(i = 0; i <= 21; i++) {
                profiles.visual.data.push(visual_circle[i]);
            }
            for(i = 125; i >= 104; i--) {
                profiles.visual.data.push(interaction_circle[i]);
            }
            for(i = 125; i >= 104; i--) {
                profiles.visual.data.push(techniek_circle[i]);
            }

            // Unicorn profile
            // tech 124 - 21
            // visual 42 - 64
            // interaction 84 - 104
            profiles.unicorn.data.push(techniek_circle[124]);
            profiles.unicorn.data.push(techniek_circle[125]);
            for(i = 0; i <= 21; i++) {
                profiles.unicorn.data.push(techniek_circle[i]);
            }
            for(i = 42; i <= 64; i++) {
                profiles.unicorn.data.push(visual_circle[i]);
            }
            for(i = 84; i <= 104; i++) {
                profiles.unicorn.data.push(interaction_circle[i]);
            }

            // Tech + interaction profile
            // tech 21 - 42
            // interaction 61 - 83
            // visual 64 - 42
            for(i = 21; i <= 42; i++) {
                profiles.tech_interaction.data.push(techniek_circle[i]);
            }
            for(i = 61; i <= 83; i++) {
                profiles.tech_interaction.data.push(interaction_circle[i]);
            }
            for(i = 64; i >= 42; i--) {
                profiles.tech_interaction.data.push(visual_circle[i]);
            }

            // Tech + visual profile
            // tech 104 - 123
            // interaction 104 - 83
            // visual 64 - 83
            for(i = 104; i <= 124; i++) {
                profiles.tech_visual.data.push(techniek_circle[i]);
            }
            for(i = 104; i >= 83; i--) {
                profiles.tech_visual.data.push(interaction_circle[i]);
            }
            for(i = 64; i <= 83; i++) {
                profiles.tech_visual.data.push(visual_circle[i]);
            }

            // Visual + interaction profile
            // tech 124 - 21
            // visual 41 - 21
            // interaction 1 - 104
            profiles.visual_interaction.data.push(techniek_circle[124]);
            profiles.visual_interaction.data.push(techniek_circle[125]);
            for(i = 0; i <= 21; i++) {
                profiles.visual_interaction.data.push(techniek_circle[i]);
            }
            for(i = 41; i >= 21; i--) {
                profiles.visual_interaction.data.push(visual_circle[i]);
            }
            profiles.visual_interaction.data.push(interaction_circle[1]);
            profiles.visual_interaction.data.push(interaction_circle[0]);
            for(i = 125; i >= 104; i--) {
                profiles.visual_interaction.data.push(interaction_circle[i]);
            }

            $('#'+container).highcharts({
                chart: {
                    width: circle_template.radius * 2.75,
                    height: circle_template.radius * 2.5,
                },
                title: { text: 'My CMD profile' },
                xAxis: {
                    max: circle_template.radius * 2 * 2,
                    lineWidth: 0,
                    gridLineWidth: 0,
                    tickWidth: 0,
                    title: { enabled: false },
                    labels: { enabled:false },
                    startOnTick: true
                },
                yAxis: {
                    max: circle_template.radius * 2 * 2,
                    gridLineWidth: 0,
                    title: { enabled: false },
                    labels: { enabled:false },
                },
                legend: { enabled: false },
                series: [
                    {
                        name: 'Techniek',
                        type: 'polygon',
                        data: techniek_circle,
                        color: Highcharts.Color('#ffcc00').setOpacity(0.33).get(),
                        enableMouseTracking: false,
                        dataLabels: {
                            enabled: true,
                            rotation: 45,
                            x: 20,
                            y: 0,
                            formatter: function() {
                                if(_.indexOf(this.series.data,this.point) == Math.floor(circle_template.steps * 0.6)) {
                                    return "TECHIEK";
                                }
                            },
                        }
                    },
                    {
                        name: 'Visual design',
                        type: 'polygon',
                        data: visual_circle,
                        color: Highcharts.Color('#ffcc00').setOpacity(0.33).get(),
                        enableMouseTracking: false,
                        dataLabels: {
                            enabled: true,
                            rotation: -45,
                            x: -25,
                            y: -5,
                            formatter: function() {
                                if(_.indexOf(this.series.data,this.point) == Math.floor(circle_template.steps * 0.9)) {
                                    return "VISUAL DESIGN";
                                }
                            },
                        }
                    },
                    {
                        name: 'Interaction design',
                        type: 'polygon',
                        data: interaction_circle,
                        color: Highcharts.Color('#ffcc00').setOpacity(0.33).get(),
                        enableMouseTracking: false,
                        dataLabels: {
                            enabled: true,
                            x: 40,
                            y: 40,
                            formatter: function() {
                                if(_.indexOf(this.series.data,this.point) == Math.floor(circle_template.steps * 0.3)) {
                                    return "INTERACTION DESIGN";
                                }
                            },
                        }
                    },
                    {
                        visible: profiles.tech.active,
                        type: 'polygon',
                        data: profiles.tech.data,
                        color: Highcharts.Color('#4CAF50').setOpacity(0.75).get(),
                        enableMouseTracking: false,
                    },
                    {
                        visible: profiles.interaction.active,
                        type: 'polygon',
                        data: profiles.interaction.data,
                        color: Highcharts.Color('#4CAF50').setOpacity(0.75).get(),
                        enableMouseTracking: false,
                    },
                    {
                        visible: profiles.visual.active,
                        type: 'polygon',
                        data: profiles.visual.data,
                        color: Highcharts.Color('#4CAF50').setOpacity(0.75).get(),
                        enableMouseTracking: false,
                    },
                    {
                        visible: profiles.unicorn.active,
                        type: 'polygon',
                        data: profiles.unicorn.data,
                        color: Highcharts.Color('#4CAF50').setOpacity(0.75).get(),
                        enableMouseTracking: false,
                    },
                    {
                        visible: profiles.tech_interaction.active,
                        type: 'polygon',
                        data: profiles.tech_interaction.data,
                        color: Highcharts.Color('#4CAF50').setOpacity(0.75).get(),
                        enableMouseTracking: false,
                    },
                    {
                        visible: profiles.tech_visual.active,
                        type: 'polygon',
                        data: profiles.tech_visual.data,
                        color: Highcharts.Color('#4CAF50').setOpacity(0.75).get(),
                        enableMouseTracking: false,
                    },
                    {
                        visible: profiles.visual_interaction.active,
                        type: 'polygon',
                        data: profiles.visual_interaction.data,
                        color: Highcharts.Color('#4CAF50').setOpacity(0.75).get(),
                        enableMouseTracking: false,
                    },
                ],
                credits: {
                    href: '',
                    text: moment().format('DD/MM/YY HH:mm')
                },
                exporting: {
                    enabled: Global.getAccess() > 1 ? true : false,
                }
            });

        }

    }

}());
