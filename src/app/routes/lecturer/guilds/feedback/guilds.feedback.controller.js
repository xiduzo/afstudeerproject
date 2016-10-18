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
        self.createChart = createChart;
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
        self.horizontal_axis = [];
        self.selected_member = null;
        self.loading_page = true;
        self.first_line_graph_load = true;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getGuild($stateParams.guildUuid)
        .then(function(response) {
            Global.setRouteTitle('Group feedback', response.name);
            var data = response;
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
                var tempObj = {
                    duration: response.course_duration,
                    start: response.start
                };
                self.buildChartData(data, tempObj);
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
        function buildChartData(data, world_data) {
            var horizontal_axis = [];
            var week = 0;
            for(var i = world_data.duration; i > 0; i-=7) {
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
                    // Group the rule types for each week
                    endorsements = _.groupBy(endorsements, function(endorsement) {
                        return endorsement.rule.rule_type;
                    });


                    var points = 0;
                    // Count the points per week
                    _.each(endorsements, function(endorsement_type, index) {
                        _.each(endorsement_type, function(type_group) {
                            points += type_group.rule.points;
                        });
                    });

                    self.graphs_data.line[index] += points;
                    member.line_data.push(points);

                });

            });
            console.log(self.members_data);

            // Calculating the average points for the users
            self.graphs_data.line = _.map(self.graphs_data.line, function(line_data) {
                return line_data / self.members_data.length;
            });

            self.graphs_data.line = [
                {
                    name: 'Average',
                    data: self.graphs_data.line,
                    color: Highcharts.Color('#222222').setOpacity(0.1).get(),
                }
            ];

            _.each(self.members_data, function(member, index) {
                self.graphs_data.line.push({
                    visible: member.selected,
                    name: member.name,
                    data: member.line_data,
                    color: member.color
                });
            });

            self.horizontal_axis = _.map(horizontal_axis, function(axis_point) {
                axis_point = 'Week ' + (axis_point+1);
                return axis_point;
            });
            
            self.createChart();
        }

        function createChart(data) {
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
                legend: {
                    enabled: false
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
                        states: {
                            hover: {
                                lineWidth: 5
                            }
                        },
                        marker: {
                            enabled: false,
                        },
                    },
                    series: {
                        animation: self.first_line_graph_load
                    }
                },
                series: self.graphs_data.line,
                navigation: {
                    menuItemStyle: {
                        fontSize: '10px'
                    }
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
            });

            self.createChart();
        }


    }
}());
