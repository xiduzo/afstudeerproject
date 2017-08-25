  // TODO
// 2 tabs indentation everywhere, i'm sloppy... sue me
// xxx - Xiduzo

(function () {
    'use strict';

    angular
        .module('cmd.home')
        .controller('StudentDashboardController', StudentDashboardController);

    /** @ngInject */
    function StudentDashboardController(
        $scope,
        $filter,
        Global,
        Guild,
        World,
        TrelloApi,
        Notifications,
        localStorageService,
        STUDENT_ACCESS_LEVEL,
        COLORS,
        MAX_STAR_RATING
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
        self.gotoBoard = gotoBoard;
        self.buildGraphData = buildGraphData;
        self.createChart = createChart;
        self.getGuildData = getGuildData;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.selected_guild = Global.getSelectedGuild();
        self.user.trello = localStorageService.get('trello_user');
        self.guilds = [];
        self.loading_page = false;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
             Broadcasts
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        $scope.$on('guild-changed', function(event, guild) {
          self.selected_guild = guild;

          if(guild !== undefined) {
            self.getGuildData(guild);
          }
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
             Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
             Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        if(self.selected_guild !== undefined && self.selected_guild !== null) {
          self.getGuildData(self.selected_guild);
        }

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function gotoCard(card) {
            window.open(card.shortUrl);
        }

        function gotoBoard(board) {
          window.open('http://trello.com/b/' + board);
        }

        function getGuildData(guild) {
          self.loading_page = true;
          if(_.findWhere(self.guilds, {id: guild})) {
            // TODO
            // Show this guild without building the data again
            setTimeout(function () {
              self.buildGraphData(_.findWhere(self.guilds, {id: guild}));
            }, 100);
            self.loading_page = false;
            return false;
          }

          Guild.getGuild(guild)
          .then(function(response) {
            guild = response;
            if(!guild.trello_done_list || !guild.trello_board) {
              guild.trello_not_configured = true;
              self.loading_page = false;
              self.guilds.push(guild);
            } else {
              World.getWorld(guild.world.id)
              .then(function(response) {
                response.end = moment(response.start).add(response.course_duration, 'weeks').add(6, 'days');
                guild.world = response;
                if(moment().isAfter(moment(guild.world.start).add(guild.world.course_duration,'weeks').add(6, 'days'), 'day')) {
                  guild.ended = true;
                }
                self.guilds.push(guild);
                self.loading_page = false;

                setTimeout(function () {
                  self.buildGraphData(guild);
                }, 100);

              })
              .catch(function(error) {
                  console.log(error);
              });

              TrelloApi.Authenticate()
              .then(function() {
                TrelloApi.Rest('GET', 'boards/' + guild.trello_board + '/cards')
                .then(function(response) {

                  // We don't care about cards that have been done allready
                  var cards = _.filter(response, function(card) {
                    return card.idList !== guild.trello_done_list;
                  });

                  // Only return cards where you are one of the members
                  cards = _.filter(cards, function(card) {
                    return  _.contains(card.idMembers, self.user.trello.id);
                  });

                  // Add the created_at on the card b/c trello won't give this to us
                  _.each(cards, function(card) {
                    card.created_at = moment(new Date(1000*parseInt(card.id.substring(0,8),16)));
                  });

                  guild.trello_cards = cards;

                })
                .catch(function(error) {
                    console.log(error);
                });
              })
              .catch(function(error) {
                  console.log(error);
              });
            }
          })
          .catch(function(error) {
            console.log(error);
          })
        }

        function buildGraphData(guild) {
            guild.graphs_data = {
                line: [],
                polar: []
            };
            guild.weeks = [];

            guild.members_data = [];

            _.each(guild.members, function(member, index) {
                guild.members_data.push({
                    id: member.user.id,
                    email: member.user.email,
                    name: $filter('fullUserName')(member.user),
                    color: COLORS[index],
                    endorsements: [],
                    polar_data: [],
                    line_data: [],
                });
            });

            for(var index = 0; index <= guild.world.course_duration; index++) {
                // Only show weeks that have been in the past
                if(!moment().isBefore(moment(guild.world.start).add(index, 'weeks'), 'day')) {
                    guild.weeks.push({
                        week: index,
                        name: 'Week ' + (index+1),
                        start: moment(guild.world.start).add(index, 'weeks'),
                        end: moment(guild.world.start).add(index, 'weeks').add(6, 'days'),
                        current_week: moment().isBetween(
                            moment(guild.world.start).add(index, 'weeks'),
                            moment(guild.world.start).add(index, 'weeks').add(6, 'days'),
                            'day'
                        ) ||
                        moment().isSame(moment(guild.world.start).add(index, 'weeks'), 'day') ||
                        moment().isSame(moment(guild.world.start).add(index, 'weeks').add(6, 'days'), 'day'),
                    });
                }
            }

            guild.current_week = _.findWhere(guild.weeks, { current_week: true });

            _.each(guild.weeks, function(week) {
                _.each(guild.members_data, function(member) {
                    member.line_data.push({
                        week: week.week,
                        y: 0
                    });
                });
            });

            _.each(guild.rules, function(rule) {
                // Order the endorsements per user
                _.each(rule.endorsements, function(endorsement) {
                    _.findWhere(guild.members_data, {id: endorsement.user}).endorsements.push(endorsement);
                });
            });

            _.each(guild.members_data, function(member) {
                _.each(member.endorsements, function(endorsement) {
                    if(_.findWhere(_.findWhere(guild.members_data, {id: endorsement.user}).line_data, { week: endorsement.week })) {
                        _.findWhere(_.findWhere(guild.members_data, {id: endorsement.user}).line_data, { week: endorsement.week }).y += endorsement.rating * endorsement.rule.points / MAX_STAR_RATING;
                    }
                });

                member.endorsements = _.groupBy(member.endorsements, function(endorsement) {
                    return endorsement.rule.rule_type;
                });

                _.map(member.endorsements, function(endorsements, type) {
                    member.polar_data.push({
                        type: type,
                        y: _.reduce(endorsements, function(memo, endorsement) {
                            return memo += endorsement.rating * endorsement.rule.points / MAX_STAR_RATING;
                        }, 0)
                    });
                });

            });

            // Build the average data
            var average_line_data = [];
            var average_polar_data = [
                { type: 1, y: 0 },
                { type: 2, y: 0 },
                { type: 3, y: 0 },
                { type: 4, y: 0 },
            ];

            _.each(guild.weeks, function(week) {
                average_line_data.push({
                    week: week.week,
                    y: 0
                });
            });

            _.each(guild.members_data, function(member) {
                _.each(member.line_data, function(data) {
                    _.findWhere(average_line_data, { week: data.week }).y += data.y;
                });
                _.each(member.polar_data, function(data) {
                    _.findWhere(average_polar_data, { type: Number(data.type)}).y += data.y;
                });
            });

            _.each(average_line_data, function(week) {
                week.y = week.y / _.size(guild.members_data);
            });

            _.each(average_polar_data, function(type) {
                type.y = type.y / _.size(guild.members_data);
            });

            guild.graphs_data.line.push({
                name: 'Gemiddeld',
                color: Highcharts.Color('#222222').setOpacity(0.1).get(),
                data: average_line_data
            });

            guild.graphs_data.line.push({
                name: _.findWhere(guild.members_data, {id: self.user.id}).name,
                color: '#FFCC00',
                data: _.findWhere(guild.members_data, {id: self.user.id}).line_data
            });

            guild.graphs_data.polar.push({
                name: 'Gemiddeld',
                color: Highcharts.Color('#222222').setOpacity(0.1).get(),
                data: average_polar_data
            });

            guild.graphs_data.polar.push({
                name: _.findWhere(guild.members_data, {id: self.user.id}).name,
                color: '#FFCC00',
                data: _.findWhere(guild.members_data, {id: self.user.id}).polar_data
            });

            setTimeout(function () {
                self.createChart(guild);
            }, 100);
        }

        function createChart(guild) {
            $('#line__'+guild.id).highcharts({
                chart: { type: 'spline', animation: true },
                title: { text: 'Feedback punten' },
                xAxis: { categories: _.map(guild.weeks, function(week){ return week.name; } ) },
                yAxis: {
                    title: { text: 'Punten' },
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
                            enabled: _.first(guild.graphs_data.line).data.length > 1 ? false : true,
                        },
                    },
                    series: {
                        events: {
                            legendItemClick: function () { return false; }
                        }
                    },
                },
                series: guild.graphs_data.line,
                exporting: { enabled: Global.getAccess() > 1 ? true : false, },
                credits: {
                    href: '',
                    text: moment().format('DD/MM/YY HH:mm'),
                }
            });
            $('#polar__'+guild.id).highcharts({
                chart: {
                    polar: true,
                    type: 'spline'
                },
                title: { text: 'Feedback focus' },
                xAxis: {
                    categories: [
                        'Houding',
                        'Functioneren binnen de groep',
                        'Kennisontwikkeling',
                        'Verantwoording',
                    ],
                    tickmarkPlacement: 'on',
                    lineWidth: 0
                },
                yAxis: {
                    visible: false,
                    max: _.max([
                        _.max(guild.graphs_data.polar[0].data, function(point) { return point.y; }),
                        _.max(guild.graphs_data.polar[1].data, function(point) { return point.y; })
                    ], function(max) {
                        return max.y;
                    }).y
                },
                tooltip: {
                    shared: true,
                    pointFormat: '{series.name}: <strong>{point.y:,.0f}</strong> <br/>'
                },
                plotOptions: {
                    series: {
                        events: {
                            legendItemClick: function () { return false; }
                        }
                    },
                    spline: {
                        lineWidth: 4,
                        marker: { enabled: false, },
                    },
                },
                series: guild.graphs_data.polar,
                exporting: { enabled: Global.getAccess() > 1 ? true : false, },
                credits: {
                    href: '',
                    text: moment().format('DD/MM/YY HH:mm'),
                }
            });
        }



    }
}());
