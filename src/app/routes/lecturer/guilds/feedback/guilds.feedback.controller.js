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
        COLORS
    ) {

        if(Global.getAccess() < LECTURER_ACCESS_LEVEL) {
            Global.notAllowed();
            return;
        }

        Global.setRouteTitle('Group feedback');
        Global.setRouteBackRoute('base.guilds.overview');

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.buildChartData = buildChartData;
        self.createCharts = createCharts;
        self.selectMember = selectMember;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.access = Global.getAccess();
        self.members_data = [];
        self.graphs_data = {
            line: [],
            polar: [],
        };
        self.guilds = [];
        self.horizontal_axis = [];
        self.endorsed_rules = [];
        self.selected_member = null;
        self.loading_page = true;
        self.first_line_graph_load = true;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getGuild($stateParams.guildUuid)
        .then(function(response) {
            Global.setRouteTitle('Group feedback', response.name);
            self.guild = response;
            _.each(response.members, function(member, index) {
                self.members_data.push({
                    id: member.id,
                    email: member.email,
                    name: $filter('fullUserName')(member),
                    color: COLORS[index],
                    endorsements: [],
                    line_data: [],
                    polar_data: [
                        { type: 1, points: 0 },
                        { type: 2, points: 0 },
                        { type: 3, points: 0 },
                        { type: 4, points: 0 },
                    ],
                    selected: true,
                });
            });

            self.selected_member = _.first(self.members_data);

            World.getWorld(response.world.id)
            .then(function(response) {
                self.guild.world_data = {
                    duration: response.course_duration,
                    start: response.start
                };
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
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function buildChartData(data) {
            var horizontal_axis = [];
            var week = 0;
            for(var i = data.world_data.duration; i > 0; i-=7) {
                self.graphs_data.line.push(week);
                horizontal_axis.push(week);
                week++;
            }

            _.each(data.rules, function(rule) {
                // Order the endorsements per user
                _.each(rule.endorsements, function(endorsement) {
                    _.findWhere(self.members_data, { id: endorsement.user}).endorsements.push(endorsement);
                });
            });

            _.each(self.members_data, function(member, index) {
                // Order the endorsements
                member.endorsements = _.groupBy(member.endorsements, function(endorsement) {
                    return endorsement.week;
                });

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
                            points += type_group.rule.points;

                            // Also make sure the endorsement types are safed
                            // per type on the user for the polar chart
                            _.findWhere(member.polar_data, { type: type_group.rule.rule_type}).points += points;
                        });
                    });
                    self.graphs_data.line[index] += points;
                    member.line_data.push(points);
                });
            });

            // Make sure the average is included in the graph as well
            self.graphs_data.line = [
                {
                    name: 'Average',
                    data: _.map(self.graphs_data.line, function(line_data) {
                        return line_data / self.members_data.length;
                    }),
                    color: Highcharts.Color('#222222').setOpacity(0.1).get(),
                }
            ];

            self.graphs_data.polar = [
                {
                    type: 'spline',
                    visible: true,
                    name: 'Average',
                    color: Highcharts.Color('#222222').setOpacity(0.1).get(),
                    data: [0, 0, 0, 0]
                }
            ];

            _.each(self.members_data, function(member, index) {
                self.graphs_data.line.push({
                    visible: member.selected,
                    name: member.name,
                    data: member.line_data,
                    color: member.color
                });

                member.polar_data =_.map(member.polar_data, function(data) {
                    return data.points;
                });

                _.each(member.polar_data, function(data, index) {
                    self.graphs_data.polar[0].data[index] += data;
                });

                self.graphs_data.polar.push({
                    type: 'spline',
                    visible: member.selected,
                    name: member.name,
                    data: member.polar_data,
                    color: member.color
                });

            });

            self.graphs_data.polar[0].data = _.map(self.graphs_data.polar[0].data, function(polar_data) {
                return polar_data / self.members_data.length;
            });

            self.horizontal_axis = _.map(horizontal_axis, function(axis_point) {
                axis_point = 'Week ' + (axis_point+1);
                return axis_point;
            });

            self.createCharts();
        }

        function createCharts() {
            $('#chart').highcharts({
                chart: {
                    type: 'spline',
                    animation: self.first_line_graph_load
                },
                title: {
                    text: 'Endorsement points'
                },
                subtitle: {
                    text: 'May 31 and and June 1, 2015 at two locations in Vik i Sogn, Norway'
                },
                xAxis: {
                    categories: self.horizontal_axis
                },
                yAxis: {
                    title: {
                        text: 'Points'
                    },
                    minorGridLineWidth: 0,
                    gridLineWidth: 1,
                    alternateGridColor: null,
                },
                tooltip: {
                    shared: true,
                    pointFormat: '{series.name}: <strong>{point.y:,.0f}</strong> <br/>'
                },
                plotOptions: {
                    spline: {
                        lineWidth: 4,
                        marker: {
                            enabled: false,
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
                credits: {
                    href: '',
                    text: moment().format('DD/MM/YY HH:mm'),
                }
            });
            $('#polar').highcharts({
                chart: {
                    polar: true
                },
                title: { text: 'Endorsement focus' },
                xAxis: {
                    categories: [
                        'Houding',
                        'Functioneren binnen de groep',
                        'Kennisontwikkeling',
                        'Verantwoording',
                    ],
                    tickmarkPlacement: 'on',
                    lineWidth: 0,
                    // gridLineWidth: 0
                },
                yAxis: {
                    gridLineInterpolation: 'polygon',
                    visible: false
                },
                tooltip: {
                    shared: true,
                    pointFormat: '{series.name}: <strong>{point.y:,.0f}</strong> <br/>'
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
                credits: {
                    href: '',
                    text: moment().format('DD/MM/YY HH:mm'),
                }
            });
            self.first_line_graph_load = false;
        }

        function selectMember(member) {
            member.selected = !member.selected;

            _.each(self.members_data, function(member, index) {
                self.graphs_data.line[index + 1] = {
                    visible: member.selected,
                    name: member.name,
                    data: member.line_data,
                    color: member.color
                };

                self.graphs_data.polar[index + 1] = {
                    type: 'spline',
                    visible: member.selected,
                    name: member.name,
                    data: member.polar_data,
                    color: member.color
                };
            });

            self.createCharts();
        }


    }
}());
