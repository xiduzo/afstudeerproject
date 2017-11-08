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
        toastr,
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

        var vm = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        vm.gotoCard = gotoCard;
        vm.gotoBoard = gotoBoard;
        vm.buildGraphData = buildGraphData;
        vm.createChart = createChart;
        vm.getGuildData = getGuildData;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        vm.user = Global.getUser();
        vm.selected_guild = Global.getSelectedGuild();
        vm.user.trello = localStorageService.get('trello_user');
        vm.guilds = [];
        vm.loading_page = true;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
             Broadcasts
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        $scope.$on('guild-changed', function(event, guild) {
          vm.selected_guild = guild;

          if(guild !== undefined) {
            if(!_.findWhere(vm.guilds, {id: guild})) {
              vm.getGuildData(guild);
            } else {
              vm.buildGraphData(_.findWhere(vm.guilds, { id: guild}));
            }
          }
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
             Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
             Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        if(vm.selected_guild !== undefined && vm.selected_guild !== null) {
          vm.getGuildData(vm.selected_guild);
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

        function getTrelloCards(guild) {
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
                return  _.contains(card.idMembers, vm.user.trello.id);
              });

              // Add the created_at on the card b/c trello won't give this to us
              _.each(cards, function(card) {
                card.created_at = moment(new Date(1000*parseInt(card.id.substring(0,8),16)));
              });

              guild.trello_cards = cards;

            })
            .catch(function(error) {
              toastr.error(error);
            });
          })
          .catch(function(error) {
            toastr.error(error);
          });
        }

        function getGuildData(guild) {
          Guild.getGuild(guild)
          .then(function(response) {
            vm.loading_page = false;
            guild = response;
            var local_guilds = localStorageService.get('guilds') || [];

            guild.world.end = moment(guild.world.start).add(guild.world.course_duration, 'weeks').add(6, 'days');
            if(moment().isAfter(moment(guild.world.start).add(guild.world.course_duration,'weeks').add(6, 'days'), 'day')) {
              guild.ended = true;
            }

            // Check for trello
            if(!guild.trello_done_list || !guild.trello_board) {
              guild.trello_not_configured = true;
            } else {
              getTrelloCards(guild);
            }

            vm.guilds.push(guild);

            // Get endorsements from the localstorage
            if(_.findWhere(local_guilds, {guild: guild.id}) && moment(_.findWhere(local_guilds, {guild: guild.id}).datetime).isAfter(moment().subtract(1, 'hours'))) {
              guild.rules = _.findWhere(local_guilds, {guild: guild.id}).rules;
              buildGraphData(guild);
            } else {
              Guild.V2getGuildRules(guild.id)
              .then(function(response) {
                local_guilds = localStorageService.get('guilds') || [];
                var local_guild = _.findWhere(local_guilds, {guild: guild.id});
                var tempObj = { guild: guild.id, datetime: moment(), rules: response.data };

                // Check if we need to update the local storage
                if(local_guild) {
                  local_guilds[_.indexOf(local_guilds, local_guild)] = tempObj;
                } else {
                  local_guilds.push(tempObj);
                }

                localStorageService.set('guilds', local_guilds);

                guild.rules = response.data;
                buildGraphData(guild);

              })
              .catch(function(error) {
                toastr.error(error);
              });
            }

          })
          .catch(function(error) {
            toastr.error(error);
          });
        }

        function buildGraphData(guild) {
            guild.graphs_data = { line: [], polar: [] };
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
                member.line_data.push({ week: week.week, y: 0 });
              });
            });

            var all_endorsements = [];


            _.each(guild.rules, function(rule) {
              // Order the endorsements per user
              _.each(rule.endorsements, function(endorsement) {
                endorsement.rule_type = rule.rule_type;
                endorsement.rule_points = rule.points;

                // Check if the rule allready exist
                if(_.findWhere(all_endorsements, {
                  week: endorsement.week,
                  user: endorsement.user,
                  endorsed_by: endorsement.endorsed_by,
                  rule_id: endorsement.rule_id
                })) {
                  // Remove rule endorsement
                  Guild.removeEndorsement(endorsement.id);
                } else {
                  all_endorsements.push(endorsement);
                  // Add the endorsement to the user
                  if(_.findWhere(guild.members_data, {id: endorsement.user})) {
                      _.findWhere(guild.members_data, {id: endorsement.user}).endorsements.push(endorsement);
                  }
                }

              });
            });

            _.each(guild.members_data, function(member) {
              _.each(member.endorsements, function(endorsement) {
                // Only add points when you have given feedback
                if(_.findWhere(all_endorsements, {
                  week: endorsement.week,
                  user: endorsement.endorsed_by,
                  endorsed_by: endorsement.user,
                  rule_id: endorsement.rule_id
                })) {
                  if(_.findWhere(_.findWhere(guild.members_data, {id: endorsement.user}).line_data, { week: endorsement.week })) {
                    _.findWhere(_.findWhere(guild.members_data, {id: endorsement.user}).line_data, { week: endorsement.week }).y += endorsement.rating * endorsement.rule_points / MAX_STAR_RATING;
                  }
                }
              });

              member.endorsements = _.groupBy(member.endorsements, function(endorsement) {
                return endorsement.rule_type;
              });

              _.map(member.endorsements, function(endorsements, type) {
                member.polar_data.push({
                  type: type,
                  points: _.reduce(endorsements, function(memo, endorsement) {
                    // Only add points when you have given points
                    if(_.findWhere(all_endorsements, {
                      week: endorsement.week,
                      user: endorsement.endorsed_by,
                      endorsed_by: endorsement.user,
                      rule_id: endorsement.rule_id
                    })) {
                      memo.gained += endorsement.rating * endorsement.rule_points / MAX_STAR_RATING;
                    }
                    // Allways add total points for spider chart
                    memo.total += endorsement.rule_points;
                    return memo;
                  }, {gained: 0, total: 0})
                });
              });

            });

            // Build the average data
            var average_line_data = [];
            var average_polar_data = [
              { type: 1, points: 0, total: 0, y: 0 },
              { type: 2, points: 0, total: 0, y: 0 },
              { type: 3, points: 0, total: 0, y: 0 },
              { type: 4, points: 0, total: 0, y: 0 },
            ];

            _.each(guild.weeks, function(week) {
              average_line_data.push({ week: week.week, y: 0 });
            });

            _.each(guild.members_data, function(member) {
              _.each(member.line_data, function(data) {
                _.findWhere(average_line_data, { week: data.week }).y += data.y;
              });
              _.each(member.polar_data, function(data) {
                _.findWhere(average_polar_data, { type: Number(data.type)}).points += data.points.gained;
                _.findWhere(average_polar_data, { type: Number(data.type)}).total += data.points.total;
                data.y = data.points.gained * 100 / data.points.total;
              });
            });

            _.each(average_line_data, function(week) {
              week.y = week.y / _.size(guild.members_data);
            });

            _.each(average_polar_data, function(type) {
              type.y = type.points * 100 / type.total;
            });

            guild.graphs_data.line.push({
              name: 'Gemiddeld',
              color: Highcharts.Color('#222222').setOpacity(0.1).get(),
              data: average_line_data
            });

            guild.graphs_data.line.push({
              name: _.findWhere(guild.members_data, {id: vm.user.id}).name,
              color: '#FFCC00',
              data: _.findWhere(guild.members_data, {id: vm.user.id}).line_data
            });

            guild.graphs_data.polar.push({
              name: 'Gemiddeld',
              color: Highcharts.Color('#222222').setOpacity(0.1).get(),
              data: average_polar_data
            });

            guild.graphs_data.polar.push({
              name: _.findWhere(guild.members_data, {id: vm.user.id}).name,
              color: '#FFCC00',
              data: _.findWhere(guild.members_data, {id: vm.user.id}).polar_data
            });

            setTimeout(function () {
              vm.createChart(guild);
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
                    pointFormat: '{series.name}: <strong>{point.y:,.0f}%</strong> <br/>'
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
