(function () {
    'use strict';

    angular
        .module('cmd.guilds')
        .controller('GuildDetailFeedbackController', GuildDetailFeedbackController);

    /** @ngInject */
    function GuildDetailFeedbackController(
        $stateParams,
        $filter,
        Global,
        Guild,
        World,
        LECTURER_ACCESS_LEVEL,
        COLORS,
        MAX_STAR_RATING
    ) {

        if(Global.getAccess() < LECTURER_ACCESS_LEVEL) {
            return Global.notAllowed();
        }

        Global.setRouteTitle('Team feedback');
        Global.setRouteBackRoute('base.home.dashboards.lecturer');

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.buildChartData = buildChartData;
        self.selectMember = selectMember;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.access = Global.getAccess();
        self.members_data = [];
        self.graphs_data = {
            line: [],
            line_total: [],
            polar: [],
        };
        self.guild = null;
        self.horizontal_axis = [];
        self.endorsed_rules = [];
        self.selected_member = null;
        self.loading_page = true;
        self.first_line_graph_load = true;
        self.selected_type = null;
        self.selected_rule = null;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getGuild($stateParams.guildUuid)
        .then(function(response) {
            Global.setRouteTitle('Team feedback ' + response.name);
            self.guild = response;
            _.each(response.members, function(member, index) {
                self.members_data.push({
                    id: member.user.id,
                    name: $filter('fullUserName')(member.user),
                    color: COLORS[index],
                    endorsements: [],
                    line_data: [],
                    line_data_total: [],
                    polar_data: [
                        { type: 1, points: 0, total_points: 0 },
                        { type: 2, points: 0, total_points: 0 },
                        { type: 3, points: 0, total_points: 0 },
                        { type: 4, points: 0, total_points: 0 },
                    ],
                    selected: true,
                });
            });

            self.selected_member = _.first(self.members_data);

            World.getWorld(response.world.id)
            .then(function(response) {
                self.guild.world = response;
                self.buildChartData(self.guild);
            })
            .catch(function(error) {
                console.log(error);
            });

            self.loading_page = false;

        })
        .catch(function(error) {
            console.log(error);
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function roundToTwo(num) {
            return parseFloat(num.toFixed(2));
        }

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function buildChartData(data) {
            for(var index = 0; index <= self.guild.world.course_duration - 1; index++ ) {
                // Only show weeks that have been in the past
                if(!moment().isBefore(moment(self.guild.world.start).add(index, 'weeks'), 'day')) {
                    self.graphs_data.line.push(0);
                    self.horizontal_axis.push('Week ' + (index+1));
                }
            }

            _.each(data.rules, function(rule) {
                // Order the endorsements per user
                _.each(rule.endorsements, function(endorsement) {
                  var user = _.findWhere(self.members_data, { id: endorsement.user});
                  if(!user) { return false }
                    user.endorsements.push(endorsement);
                });
            });

            _.each(self.members_data, function(member, index) {
                // Order the endorsements
                member.endorsements = _.groupBy(member.endorsements, function(endorsement) {
                    if(!moment().isBefore(moment(self.guild.world.start).add(endorsement.week+1, 'weeks'), 'day')) {
                        return endorsement.week;
                    }
                });

                var total_points = 0;

                _.each(member.endorsements, function(endorsements, index) {
                    // Group the endorsements per week
                    endorsements = _.groupBy(endorsements, function(endorsement) {
                        return endorsement.rule.rule_type;
                    });

                    var points = 0;
                    // Count the points per week
                    _.each(endorsements, function(endorsement_type, index) {
                        _.each(endorsement_type, function(type_group) {
                            if(_.findWhere(self.endorsed_rules, {id: type_group.rule.id})) {
                                _.findWhere(self.endorsed_rules, {id: type_group.rule.id}).amount++;
                            } else {
                                self.endorsed_rules.push({
                                    id: type_group.rule.id,
                                    rule: type_group.rule,
                                    amount: 1
                                });
                            }

                            points += type_group.rating * type_group.rule.points / MAX_STAR_RATING;
                            total_points += type_group.rating * type_group.rule.points / MAX_STAR_RATING;

                            // Also make sure the endorsement types are saved
                            // per type on the user for the polar chart
                            // and the total points which could be gathered
                            _.findWhere(member.polar_data, { type: type_group.rule.rule_type }).points += type_group.rating * type_group.rule.points / MAX_STAR_RATING;
                            _.findWhere(member.polar_data, { type: type_group.rule.rule_type }).total_points += type_group.rule.points;
                        });
                    });
                    member.line_data.push({
                        y: points,
                        total: total_points,
                    });
                    member.line_data_total.push(total_points);
                });
            });

            _.each(self.members_data, function(data) {
                _.each(data.line_data, function(points, index) {
                    if(points.y) {
                        self.graphs_data.line[index] += points.y;
                    }
                });
                _.each(data.line_data_total, function(points, index) {
                    if(points) {
                        console.log(points);
                        self.graphs_data.line_total[index] += points;
                    }
                });
            });

            console.log(self.graphs_data.line_total);

            // Make sure the average is included in the graph as well
            self.graphs_data.line = [
                {
                    name: 'Gemiddeld',
                    data: _.map(self.graphs_data.line, function(line_data, index) {
                        return {
                            y: line_data / self.members_data.length,
                            total: self.graphs_data.line_total[index] / self.members_data.length
                        };
                    }),
                    color: Highcharts.Color('#222222').setOpacity(0.1).get(),
                    yAxis: 0
                },
                {
                    name: 'Gemiddeld totaal',
                    data: _.map(self.graphs_data.line_total, function(line_data, index) {
                        // console.log(line_data, self.members_data.length);
                        // return line_data / self.members_data.length;
                    }),
                    color: Highcharts.Color('#222222').setOpacity(0.1).get(),
                    yAxis: 1,
                    dashStyle: 'shortdot',
                    enableMouseTracking: false,
                    showInLegend: false
                }
            ];

            self.graphs_data.polar = [
                {
                    name: 'Gemiddeld',
                    visible: true,
                    color: Highcharts.Color('#222222').setOpacity(0.1).get(),
                    data: [0, 0, 0, 0]
                }
            ];

            _.each(self.members_data, function(member, index) {
                self.graphs_data.line.push({
                    visible: member.selected,
                    name: member.name,
                    data: member.line_data,
                    color: member.color,
                    yAxis: 0
                });

                self.graphs_data.line.push({
                    visible: member.selected,
                    name: member.name,
                    data: member.line_data_total,
                    color: Highcharts.Color(member.color).setOpacity(0.33).get(),
                    yAxis: 1,
                    dashStyle: 'shortdot',
                    enableMouseTracking: false,
                    showInLegend: false
                });

                member.polar_data =_.map(member.polar_data, function(data) {
                    return (data.points * 100 / data.total_points) || 0;
                });

                _.each(member.polar_data, function(data, index) {
                    self.graphs_data.polar[0].data[index] += data || 0;
                });

                self.graphs_data.polar.push({
                    visible: member.selected,
                    name: member.name,
                    data: member.polar_data,
                    color: member.color
                });

            });

            self.graphs_data.polar[0].data = _.map(self.graphs_data.polar[0].data, function(polar_data) {
                return polar_data / self.members_data.length;
            });

            createCharts();
        }

        function createCharts() {
            $('#chart').highcharts({
                chart: {
                    type: 'spline',
                    animation: self.first_line_graph_load
                },
                title: {
                    text: 'Feedback punten ' + self.guild.name
                },
                subtitle: {
                    text: ''
                },
                xAxis: {
                    categories: self.horizontal_axis
                },
                yAxis: [{
                    title: {
                        text: 'Punten'
                    },
                    minorGridLineWidth: 0,
                    gridLineWidth: 1,
                    alternateGridColor: null,
                },{
                    title: {
                        text: 'Totaal aantal punten'
                    },
                    minorGridLineWidth: 0,
                    gridLineWidth: 1,
                    alternateGridColor: null,
                    opposite: true
                }],
                tooltip: {
                    shared: true,
                    pointFormat: '{series.name}: <strong>{point.y:,.0f}</strong> (totaal {point.total:,.0f}) <br/>'
                },
                plotOptions: {
                    spline: {
                        lineWidth: 4,
                        marker: {
                            enabled: true,
                            // radius: 5
                            symbol: 'circle'
                        },
                    },
                    series: {
                        animation: self.first_line_graph_load,
                        events: {
                            legendItemClick: function () {
                                return false;
                            }
                        }
                    },
                },
                series: self.graphs_data.line,
                exporting: {
                  filename: self.guild.name + "_" + moment("DD/MM")
                },
                credits: {
                    href: '',
                    text: moment().format('DD/MM/YY HH:mm'),
                }
            });
            $('#polar').highcharts({
                chart: {
                    polar: true,
                    type: 'spline'
                },
                title: { text: 'Feedback focus ' + self.guild.name },
                xAxis: {
                    categories: [
                        'Houding',
                        'Functioneren binnen de groep',
                        'Kennisontwikkeling',
                        'Verantwoording',
                    ],
                    tickmarkPlacement: 'on',
                    lineWidth: 0,
                },
                yAxis: {
                    gridLineInterpolation: 'polygon',
                    visible: false
                },
                tooltip: {
                    shared: true,
                    pointFormat: '{series.name}: <strong>{point.y:,.0f}%</strong> <br/>'
                },
                plotOptions: {
                    series: {
                        animation: self.first_line_graph_load,
                        events: {
                            legendItemClick: function () {
                                return false;
                            }
                        }
                    },
                    spline: {
                        lineWidth: 4,
                        marker: {
                            enabled: false,
                        },
                    },
                },
                series: self.graphs_data.polar,
                exporting: {
                  filename: self.guild.name + "_" + moment()
                },
                credits: {
                    href: '',
                    text: moment().format('DD/MM/YY HH:mm'),
                }
            });

            buildPieData();
            self.first_line_graph_load = false;
        }

        function buildPieData(animation) {
            animation = animation ? true : false;
            var pie_data = _.groupBy(self.guild.rules, function(rule) {
                return rule.rule_type;
            });
            var series = [
                {
                    name: 'Type',
                    size: '60%',
                    data: [],
                    visible: self.selected_rule ? false : true,
                    events: {
                        click: function (event) {
                            if(self.selected_type && self.selected_type === event.point.name) {
                                self.selected_type = null;
                            } else {
                                self.selected_type = event.point.name;
                            }
                            return buildPieData(true);
                        }
                    },
                    dataLabels: {
                        formatter: function () {
                            return this.point.name;
                        },
                        color: self.selected_type ? '#ffffff' : '#6a6a6a',
                        connectorWidth: 0,
                        distance: self.selected_type ? -75 : 75,
                        style: {
                            fontWeight: self.selected_type ? "bold" : "normal",
                            textOutline: '0px 0px contrast'
                        }
                    }
                },
                {
                    name: 'Rules',
                    size: self.selected_rule ? '80%' : '95%',
                    innerSize: self.selected_rule ? '0' : '65%',
                    data: [],
                    events: {
                        click: function (event) {
                            if(self.selected_rule && self.selected_rule === event.point.name) {
                                self.selected_rule = null;
                            } else {
                                self.selected_rule = event.point.name;
                            }
                            self.selected_type = null;
                            return buildPieData(true);
                        }
                    },
                    dataLabels: {
                        formatter: function () {
                            return self.selected_rule ? this.point.name : null;
                        },
                        color: '#ffffff',
                        distance: -100,
                    }
                },
                {
                    name: 'Users feedback',
                    size: '100%',
                    innerSize: self.selected_rule ? '80%' : '95%',
                    data: [],
                },
            ];

            var selected_users = _.filter(self.members_data, { selected: true });

            _.each(pie_data, function(pie_piece, index) {
                var name = '';
                var pie_piece_points = 0;
                var PIE_COLORS = ['#2196F3', '#E91E63', '#FFEB3B', '#FF9800'];

                switch (pie_piece[0].rule_type) {
                    case 1:
                        name = 'Houding';
                        break;
                    case 2:
                        name = 'Functioneren binnen<br/>de groep';
                        break;
                    case 3:
                        name = 'Kennisontwikkeling';
                        break;
                    case 4:
                        name = 'Verantwoording';
                        break;
                }

                _.each(pie_piece, function(rule, rule_number) {
                    var rule_points = _.reduce(rule.endorsements, function(memo, endorsement) {
                        if(_.findWhere(selected_users, { id: endorsement.user })) {
                            return memo + endorsement.rating * endorsement.rule.points / MAX_STAR_RATING;
                        } else {
                            return memo;
                        }
                    }, 0);

                    pie_piece_points += rule_points;

                    if((self.selected_type === null || self.selected_type === name) && (self.selected_rule === null || self.selected_rule === rule.rule)) {
                        series[1].data.push({
                            name: rule.rule,
                            color: Highcharts.Color(PIE_COLORS[parseInt(index)-1]).setOpacity(1 - 0.125 * rule_number).get(),
                            y: rule_points
                        });
                        var endorsement_by_user = _.groupBy(rule.endorsements, function(endorsement) {
                            if(_.findWhere(selected_users, { id: endorsement.user })) {
                                return endorsement.user;
                            }
                        });

                        // May be interesting ?
                        _.each(endorsement_by_user, function(endorsements, index) {
                            var member = _.findWhere(self.members_data, { id: endorsements[0].user });
                            series[2].data.push({
                                name: member.name,
                                color: member.color,
                                y: _.reduce(endorsements, function(memo, endorsement) {
                                    if(_.findWhere(selected_users, { id: endorsement.user })) {
                                        return memo + endorsement.rating * endorsement.rule.points / MAX_STAR_RATING;
                                    } else {
                                        return memo;
                                    }
                                }, 0)
                            });
                        });
                    }

                });

                if(self.selected_type === null || self.selected_type === name) {
                    series[0].data.push({
                        name: name,
                        color: PIE_COLORS[parseInt(index)-1],
                        y: pie_piece_points
                    });
                }

            });
            createPieChart(series, animation);
        }

        function createPieChart(series, animation) {
            $('#pie').highcharts({
                chart: {
                    type: 'pie'
                },
                title: {
                    text: 'Feedback focus ' + self.guild.name,
                },
                subtitle: {
                    text: 'Breakdown per afspraak'
                },
                tooltip: {
                    pointFormat: 'Punten: <b>{point.y:,.0f}</b>'
                },
                plotOptions: {
                    series: {
                        animation: self.first_line_graph_load || animation,
                        dataLabels: {
                            formatter: function () {
                                return null;
                            },
                        },
                        states: {
                            hover: {
                                enabled: true
                            }
                        },
                    },
                    pie: {
                        shadow: false,
                        center: ['50%', '50%'],
                    },
                    allowPointSelect: false,
                },
                series: series,
                exporting: {
                  enabled: false,
                  filename: self.guild.name + "_" + moment()
                },
                credits: {
                    href: '',
                    text: ''
                }
            });
        }

        function selectMember(member) {
            member.selected = !member.selected;

            _.each(self.members_data, function(member, index) {
                self.graphs_data.line[index + 2] = {
                    visible: member.selected,
                    name: member.name,
                    data: member.line_data,
                    color: member.color,
                    yAxis: 0
                };
                self.graphs_data.line[index + 2 + self.members_data.length] = {
                    visible: member.selected,
                    name: member.name,
                    data: member.line_data_total,
                    color: Highcharts.Color(member.color).setOpacity(0.33).get(),
                    yAxis: 1,
                    dashStyle: 'shortdot',
                    enableMouseTracking: false,
                    showInLegend: false
                };

                self.graphs_data.polar[index + 1] = {
                    visible: member.selected,
                    name: member.name,
                    data: member.polar_data,
                    color: member.color
                };
            });

            createCharts();
        }


    }
}());
