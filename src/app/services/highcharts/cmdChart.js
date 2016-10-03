(function () {
    'use strict';

    angular
        .module('cmd.services')
        .factory('CMDChart', CMDChart);

    /** @Spiderchart */
    function CMDChart(
        Global,
        Notifications
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

        function buildpositionsObject(circle_radius, x, y) {
            var positionsObject = {
                x: {
                    min: circle_radius * x.min,
                    max: circle_radius * x.max,
                    range: function() {
                        return this.max - this.min;
                    },
                    center: function() {
                        return this.min + this.range() / 2;
                    }
                },
                y: {
                    min: circle_radius * y.min,
                    max: circle_radius * y.max,
                    range: function() {
                        return this.max - this.min;
                    },
                    center: function() {
                        return this.min + this.range() / 2;
                    }
                }
            };

            return positionsObject;
        }

        function unicornPlot(positions, data) {
            var plot = {
                x: positions.x.center() - (
                    (positions.x.range() / 4) * (data.techniek_over_treshold / 100)
                ) + (
                    (positions.x.range() / 4) * (data.visual_over_treshold / 100)
                ),
                y: positions.y.min + (
                    positions.y.range() * (
                        data.interaction_over_treshold / 100
                    )
                )
            };

            return plot;
        }

        function createChart(container, data, size, show_focus, show_focus_average) {

            if(data.techniek === undefined || data.interaction === undefined || data.visual === undefined) {
                return Notifications.simpleToast('Can\'t build the CMD circle');
            }

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

            // Setting the circles into positions
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
            // Building the circles
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
                focus: {
                    self: {x: null, y: null, active: false },
                    average: {x: null, y: null, active: false },
                }
            };

            // Center of diagram:
            // x: circle radius * 2
            // y: circle radius * 2.25
            // Minumum required % when to lit up an field
            var treshold = 40;

            // Building the focus indicator
            var positions, x, y, plot;
            var precent_per_point_over_treshold = 100 / (100 - treshold);
            var interaction_over_treshold = (data.interaction - treshold) * precent_per_point_over_treshold;
            var interaction_under_treshold = 100 - (data.interaction * 100) / treshold;
            var visual_over_treshold = (data.visual - treshold) * precent_per_point_over_treshold;
            var visual_under_treshold = 100 - (data.visual * 100) / treshold;
            var techniek_over_treshold = (data.techniek - treshold) * precent_per_point_over_treshold;
            var techniek_under_treshold = 100 - (data.techniek * 100) / treshold;

            var over_and_unders = {
                interaction_over_treshold: interaction_over_treshold,
                interaction_under_treshold: interaction_under_treshold,
                visual_over_treshold: visual_over_treshold,
                visual_under_treshold: visual_under_treshold,
                techniek_over_treshold: techniek_over_treshold,
                techniek_under_treshold: techniek_under_treshold
            };

            var interaction_over_treshold_average = null;
            var interaction_under_treshold_average = null;
            var visual_over_treshold_average = null;
            var visual_under_treshold_average = null;
            var techniek_over_treshold_average = null;
            var techniek_under_treshold_average = null;

            data.average = {
                interaction: 67,
                visual: 70,
                techniek: 52
            };

            if(data.average.interaction >= 0 && data.average.visual >= 0 && data.average.techniek >= 0) {
                interaction_over_treshold_average = (data.average.interaction - treshold) * precent_per_point_over_treshold;
                interaction_under_treshold_average = 100 - (data.average.interaction * 100) / treshold;
                visual_over_treshold_average = (data.average.visual - treshold) * precent_per_point_over_treshold;
                visual_under_treshold_average = 100 - (data.average.visual * 100) / treshold;
                techniek_over_treshold_average = (data.average.techniek - treshold) * precent_per_point_over_treshold;
                techniek_under_treshold_average = 100 - (data.average.techniek * 100) / treshold;
            } else {
                show_focus_average = false;
            }

            // Which part of the diagram should be lit up green
            if(data.techniek >= treshold && data.interaction >= treshold && data.visual >= treshold) {
                profiles.unicorn.active = true;

                // Focus indicator
                if(show_focus) {
                    x = { min: 1.5, max: 2.5 };
                    y = { min: 1.9, max: 2.6 };
                    positions = buildpositionsObject(circle_template.radius, x, y);
                    plot = unicornPlot(positions, over_and_unders);

                    profiles.focus.self.y = plot.y;

                    profiles.focus.self.x = plot.x;

                    profiles.focus.self.active = true;
                }

            } else {
                if(data.techniek >= treshold && data.interaction >= treshold) {
                    profiles.tech_interaction.active = true;

                    // Focus indicator
                    if(show_focus) {
                        x = { min: 1.1, max: 1.55 };
                        y = { min: 2.4, max: 2.9 };
                        positions = buildpositionsObject(circle_template.radius, x, y);

                        profiles.focus.self.y = positions.y.min + (
                            positions.y.range() * (
                                interaction_over_treshold / 100
                            )
                        );

                        profiles.focus.self.x = (
                            positions.x.center() - (
                                (positions.x.range() / 2) * (techniek_over_treshold / 100)
                            ) + (
                                (100 - visual_under_treshold ) / 100 * (positions.x.range() / 2)
                            )
                        );

                        profiles.focus.self.active = true;
                    }

                } else if(data.techniek >= treshold && data.visual >= treshold) {
                    profiles.tech_visual.active = true;

                    // Focus indicator
                    if(show_focus || show_focus_average) {
                        x = { min: 1.75, max: 2.25 };
                        y = { min: 1.4, max: 1.8 };
                        positions = buildpositionsObject(circle_template.radius, x, y);

                        profiles.focus.self.y = positions.y.min + (
                            (100 - interaction_under_treshold ) / 100 * positions.y.range()
                        );

                        profiles.focus.self.x = (
                            positions.x.center() - (
                                (positions.x.range() / 2) * (techniek_over_treshold / 100)
                            ) + (
                                (positions.x.range() / 2) * (visual_over_treshold / 100)
                            )
                        );

                        profiles.focus.self.active = true;
                    }

                } else if(data.interaction >= treshold && data.visual >= treshold) {
                    profiles.visual_interaction.active = true;

                    // Focus indicator
                    if(show_focus) {
                        x = { min: 2.5, max: 2.9 };
                        y = { min: 2.4, max: 2.9 };
                        positions = buildpositionsObject(circle_template.radius, x, y);

                        profiles.focus.self.y = positions.y.min + (
                            positions.y.range() * (
                                interaction_over_treshold / 100
                            )
                        );

                        profiles.focus.self.x = (
                            positions.x.center() - (
                                (100 - techniek_under_treshold ) / 100 * (positions.x.range() / 2)
                            ) + (
                                (positions.x.range() / 2) * (visual_over_treshold / 100)
                            )
                        );

                        profiles.focus.self.active = true;
                    }

                } else {
                    if(data.techniek >= treshold) {
                        profiles.tech.active = true;

                        // Focus indicator
                        if(show_focus) {
                            x = { min: 0.8, max: 1.2 };
                            y = { min: 1.3, max: 2.2 };
                            positions = buildpositionsObject(circle_template.radius, x, y);

                            profiles.focus.self.y = positions.y.min + (
                                (100 - interaction_under_treshold ) / 100 * positions.y.range()
                            );

                            profiles.focus.self.x = (
                                positions.x.center() - (
                                    (positions.x.range() / 2 ) * (techniek_over_treshold / 100)
                                ) + (
                                    (100 - visual_under_treshold ) / 100 * (positions.x.range() / 2)
                                )
                            );

                            profiles.focus.self.active = true;
                        }

                    } else if(data.interaction >= treshold) {
                        profiles.interaction.active = true;

                        // Focus indicator
                        if(show_focus) {
                            x = { min: 1.5, max: 2.5 };
                            y = { min: 3, max: 3.6 };
                            positions = buildpositionsObject(circle_template.radius, x, y);

                            profiles.focus.self.y = positions.y.min + (
                                positions.y.range() * (
                                    interaction_over_treshold / 100
                                )
                            );

                            profiles.focus.self.x = (
                                positions.x.center() - (
                                    (100 - techniek_under_treshold ) / 100 * (positions.x.range() / 2)
                                ) + (
                                    (100 - visual_under_treshold ) / 100 * (positions.x.range() / 2)
                                )
                            );

                            profiles.focus.self.active = true;
                        }

                    } else if(data.visual >= treshold) {
                        profiles.visual.active = true;

                        // Focus indicator
                        if(show_focus) {
                            x = { min: 2.85, max: 3.35 };
                            y = { min: 1.5, max: 2.2 };
                            positions = buildpositionsObject(circle_template.radius, x, y);

                            profiles.focus.self.y = positions.y.min + (
                                (100 - interaction_under_treshold ) / 100 * positions.y.range()
                            );

                            profiles.focus.self.x = (
                                positions.x.center() - (
                                    (100 - techniek_under_treshold ) / 100 * (positions.x.range() / 2)
                                ) + (
                                    (positions.x.range() / 2 ) * (visual_over_treshold / 100)
                                )
                            );

                            profiles.focus.self.active = true;
                        }
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

            var chart_size = {
                width: null,
                height: null
            };

            switch (size) {
                case 'small':
                    chart_size.width = circle_template.radius * 2.2;
                    chart_size.height = circle_template.radius * 1.95;
                    break;
                default:
                    chart_size.width = circle_template.radius * 2.75;
                    chart_size.height = circle_template.radius * 2.5;

            }

            Highcharts.chart(container, {
                chart: {
                    width: chart_size.width,
                    height: chart_size.height,
                },
                title: { text: 'CMD profile' },
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
                plotOptions: {
                    series: {
                        animation: false,
                        dataLabels: {
                            style: {
                                fontSize: size === 'small' ? 10 : 12
                            },
                        }
                    }
                },
                series: [
                    {
                        name: 'Techniek',
                        type: 'polygon',
                        data: techniek_circle,
                        color: Highcharts.Color('#FFC107').setOpacity(0.4).get(),
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
                        color: Highcharts.Color('#FFC107').setOpacity(0.4).get(),
                        enableMouseTracking: false,
                        dataLabels: {
                            enabled: true,
                            rotation: -45,
                            x: -25,
                            y: -5,
                            formatter: function() {
                                if(_.indexOf(this.series.data,this.point) == Math.floor(circle_template.steps * 0.9)) {
                                    return "VISUAL";
                                }
                            },
                        }
                    },
                    {
                        name: 'Interaction design',
                        type: 'polygon',
                        data: interaction_circle,
                        color: Highcharts.Color('#FFC107').setOpacity(0.4).get(),
                        enableMouseTracking: false,
                        dataLabels: {
                            enabled: true,
                            x: size === 'small' ? 30 : 40,
                            y: 40,
                            formatter: function() {
                                if(_.indexOf(this.series.data,this.point) == Math.floor(circle_template.steps * 0.3)) {
                                    return "INTERACTION";
                                }
                            },
                        }
                    },
                    {
                        name: 'profile_tech',
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
                    {
                        visible: profiles.focus.average.active,
                        name: 'Average focus',
                        type: 'scatter',
                        color: Highcharts.Color('#000').setOpacity(0.5).get(),
                        data: [
                            [profiles.focus.average.x, profiles.focus.average.y]
                        ],
                        marker: {
                            radius: 10,
                            symbol: 'circle'
                        }
                    },
                    {
                        visible: profiles.focus.self.active,
                        name: 'Your focus',
                        type: 'scatter',
                        color: '#000',
                        data: [
                            [profiles.focus.self.x, profiles.focus.self.y]
                        ],
                        marker: {
                            radius: 15,
                            symbol: 'circle'
                        }
                    },
                ],
                tooltip: {
                    headerFormat: '<strong>{series.name}</strong>',
                    pointFormat: ''
                },
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
