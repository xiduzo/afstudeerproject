(function () {
    'use strict';

    angular
        .module('cmd.home')
        .controller('StudentDashboardController', StudentDashboardController);

    /** @ngInject */
    function StudentDashboardController(
        $rootScope,
        $filter,
        Global,
        Guild,
        World,
        TrelloApi,
        localStorageService,
        Notifications,
        STUDENT_ACCESS_LEVEL,
        COLORS
    ) {

        if(Global.getAccess() < STUDENT_ACCESS_LEVEL) {
            return Global.notAllowed();
        }

        Global.setRouteTitle('Dashboard');

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.gotoCard = gotoCard;
        self.buildGraphData = buildGraphData;
        self.createChart = createChart;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.selected_guild = Global.getSelectedGuild();
        self.user.trello = null;
        self.guilds = [];
        self.loading_page = true;


        $rootScope.$on('guild-changed', function(event, guild) {
            self.selected_guild = guild;

            if(_.findWhere(self.guilds, {id: self.selected_guild})) {
                Global.setRouteTitle('Dashboard', _.findWhere(self.guilds, {id: self.selected_guild}).name);
            }

            guild = _.findWhere(self.guilds, {id: self.selected_guild});

            if(!guild.trello_board || !guild.trello_done_list) {
                self.loading_page = false;
            } else {
                if(guild.graphs_data) {
                    setTimeout(function () {
                        self.createChart(guild);
                    }, 100);
                }
            }

        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
             Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getUserGuilds(self.user.id)
        .then(function(response) {
            self.user.guilds = [];
            self.user.trello = localStorageService.get('trello_user');

            if(!self.user.trello) {
                return Notifications.simpleToast('Please authenticate your trello account.');
            }

            _.each(response.guilds, function(guild) {
                self.guilds.push(guild.guild);
            });

            if(_.findWhere(self.guilds, {id: self.selected_guild})) {
                Global.setRouteTitle('Dashboard', _.findWhere(self.guilds, {id: self.selected_guild}).name);
            }

            _.each(self.guilds, function(guild) {
                self.loading_page = true;
                if(!guild.trello_board || !guild.trello_done_list) {
                    return false;
                }

                guild.members_data = [];

                _.each(guild.members, function(member, index) {
                    if(member.user.id === self.user.id) {
                        guild.member = member;
                    }

                    guild.members_data.push({
                        id: member.user.id,
                        email: member.user.email,
                        name: $filter('fullUserName')(member.user),
                        color: COLORS[index],
                        endorsements: [],
                        line_data: [],
                    });
                });

                World.getWorld(guild.world.id)
                .then(function(response) {
                    guild.world.name = response.name;
                    guild.world.start = response.start;
                    guild.world.course_duration = response.course_duration;
                    guild.world.end = moment(guild.world.start).add(guild.world.course_duration, "days").fromNow(true);
                    guild.world.feedback_days_left = Math.round((moment() - moment(guild.world.start)) / 86400000) % 7;

                    setTimeout(function () {
                        self.buildGraphData(guild);
                    }, 100);
                });

                TrelloApi.Authenticate()
                .then(function() {
                    TrelloApi.Rest('GET', 'boards/' + guild.trello_board + '/cards')
                    .then(function(response) {
                        var cards = _.filter(response, function(card) {
                            // No user assigned -> card is for everybody
                            if(card.idMembers < 1) {
                                return card;
                            } else if(_.contains(card.idMembers, self.user.trello.id)) {
                                return card;
                            }
                        });

                        // Only get the cards which arn't finished yet
                        cards = _.filter(cards, function(card) {
                            card.created_at = moment(new Date(1000*parseInt(card.id.substring(0,8),16)));
                            return card.idList !== guild.trello_done_list;
                        });

                        guild.todo_list = cards;
                        self.loading_page = false;
                    });
                });

            });
        });
        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
             Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function gotoCard(card) {
            window.open(card.shortUrl);
        }

        function buildGraphData(guild) {
            guild.graphs_data = {
                line: []
            };

            guild.horizontal_axis = [];

            var week = 0;
            for(var i = guild.world.course_duration; i > 0; i-=7) {
                guild.graphs_data.line.push(0);
                guild.horizontal_axis.push(week);
                week++;
            }

            _.each(guild.rules, function(rule) {
                // Order the endorsements per user
                _.each(rule.endorsements, function(endorsement) {
                    _.findWhere(guild.members_data, { id: endorsement.user}).endorsements.push(endorsement);
                });
            });

            _.each(guild.members_data, function(member, index) {
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
                            points += type_group.rule.points * (type_group.rating * 1/3);
                        });
                    });
                    guild.graphs_data.line[index] += points;
                    member.line_data.push(points);
                });
            });

            // Make sure the average is included in the graph as well
            guild.graphs_data.line = [
                {
                    name: 'Average',
                    data: _.map(guild.graphs_data.line, function(line_data) {
                        return line_data / guild.members_data.length;
                    }),
                    color: Highcharts.Color('#222222').setOpacity(0.1).get(),
                }
            ];

            _.each(guild.members_data, function(member, index) {
                if(member.id === self.user.id) {
                    guild.graphs_data.line.push({
                        visible: member.selected,
                        name: member.name,
                        data: member.line_data,
                        color: member.color
                    });
                }
            });

            guild.horizontal_axis = _.map(guild.horizontal_axis, function(axis_point) {
                axis_point = 'Week ' + (axis_point+1);
                return axis_point;
            });

            setTimeout(function () {
                self.createChart(guild);
            }, 100);
        }

        function createChart(data) {
            $('#'+data.id).highcharts({
                chart: {
                    type: 'spline',
                    animation: true
                },
                title: {
                    text: 'My endorsements'
                },
                subtitle: {
                    text: 'Feedback of you by your team members'
                },
                xAxis: {
                    categories: data.horizontal_axis
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
                series: data.graphs_data.line,
                credits: {
                    href: '',
                    text: moment().format('DD/MM/YY HH:mm'),
                }
            });
        }



    }
}());
