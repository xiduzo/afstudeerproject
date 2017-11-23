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
              getGuildData(guild);
            } else {
              prepareChartData(_.findWhere(vm.guilds, { id: guild}));
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
          getGuildData(vm.selected_guild);
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
              prepareChartData(guild);
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
                prepareChartData(guild);

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

        function prepareChartData(guild) {
          var data = {
            graphs_data: { line: [], polar: [] },
            members_data: _.map(guild.members, function(member, index) {
              return {
                id: member.user.id,
                name: $filter('fullUserName')(member.user),
                color: COLORS[index],
                endorsements: [],
                line_data: [],
                polar_data: [
                  { type: 1, points: 0, total_points: 0, y: 0 },
                  { type: 2, points: 0, total_points: 0, y: 0 },
                  { type: 3, points: 0, total_points: 0, y: 0 },
                  { type: 4, points: 0, total_points: 0, y: 0 },
                ],
                selected: member.user.id == vm.user.id ? true : false,
                showInLegend: member.user.id == vm.user.id ? true : false
              }
            }),
            first_line_graph_load: true,
            horizontal_axis: [],
            endorsed_rules: []
          };

          for(var index = 0; index <= guild.world.course_duration - 1; index++) {
            // Only show weeks that have been in the past
            if(!moment().isBefore(moment(guild.world.start).add(index, 'weeks'), 'day')) {
              data.graphs_data.line.push(0);
              data.horizontal_axis.push('Week ' + (index+1));

              // Add basis statistics for the users per week
              _.each(data.members_data, function(member) {
                member.line_data.push({y: 0, total: 0});
              });
            }
          }

          setTimeout(function () {
            processData(data, guild);
          }, 100);
        }

        function processData(data, guild) {
          var all_endorsements = [];

          // Add the endorsements to every user
          _.each(guild.rules, function(rule) {

            _.each(rule.endorsements, function(endorsement) {
              // Set some options for this endorsement
              endorsement.rule_type = rule.rule_type;
              endorsement.rule_name = rule.rule;
              endorsement.rule_points = rule.points;

              // Make sure to remove all duplicate endorsements, just in case I fucked up the DB again
              // And man, believe me, you don't want to do this by hand .__.
              if(_.findWhere(all_endorsements, { week: endorsement.week, user: endorsement.user, endorsed_by: endorsement.endorsed_by, rule: endorsement.rule })) {
                Guild.removeEndorsement(endorsement.id);
              } else {
                all_endorsements.push(endorsement);
                // Add the endorsement to the user
                var member = _.findWhere(data.members_data, { id: endorsement.user });
                if(!member) { return false; }
                member.endorsements.push(endorsement);
              }
            });
          });

          _.each(data.members_data, function(member) {
            // Group the endorsements by week
            member.endorsements = _.groupBy(member.endorsements, function(endorsement) {
              if(!moment().isBefore(moment(guild.world.start).add(endorsement.week+1, 'weeks'), 'day')) {
                return endorsement.week;
              }
            });

            var total_points = 0; // Set the total points on 0 for every user

            _.each(member.endorsements, function(endorsements, week) {
              // Group the endorsements by type
              endorsements = _.groupBy(endorsements, function(endorsement) {
                return endorsement.rule_type;
              });

              var points = 0; // Set the local points to 0 to calculate % later on

              _.each(endorsements, function(endorsement_type, index) {
                _.each(endorsement_type, function(endorsement) {

                  var endorsement_points = endorsement.rating * endorsement.rule_points / MAX_STAR_RATING;

                  // Check if the user has given feedback before receiving points
                  var given_endorsement = _.findWhere(all_endorsements, { week: endorsement.week, user: endorsement.endorsed_by, endorsed_by: endorsement.user, rule: endorsement.rule });
                  if(given_endorsement) {
                    // TODO: only give points when you gave points
                  }
                  points += endorsement_points;
                  total_points += endorsement_points;
                  _.findWhere(member.polar_data, { type: endorsement.rule_type }).points += endorsement_points;

                  // For calculating the % of points gained on maximal points able to gain
                  _.findWhere(member.polar_data, { type: endorsement.rule_type }).total_points += endorsement.rule_points;

                });
              });
              member.line_data[week-1] = {
                  y: points,
                  total: total_points,
              };

              _.each(member.polar_data, function(type) {
                type.y = type.points * 100 / type.total_points;
              });

            });

          });

          reformatData(data, guild);
        }

        function reformatData(data, guild) {

          _.each(data.members_data, function(members_data) {
            _.each(members_data.line_data, function(points, index) {
              if(points.y) { data.graphs_data.line[index] += points.y; }
            });
          });

          // Make the average line
          data.graphs_data.line = [
            {
              name: 'Gemiddeld',
              data: _.map(data.graphs_data.line, function(line_data, index) {
                return { y: line_data / data.members_data.length};
              }),
              color: Highcharts.Color('#222222').setOpacity(0.1).get(),
              yAxis: 0
            },
          ];

          // Prepare the polar data
          data.graphs_data.polar = [
            {
              name: 'Gemiddeld',
              visible: true,
              color: Highcharts.Color('#222222').setOpacity(0.1).get(),
              data: [{y: 0},{y: 0},{y: 0},{y: 0}]
            }
          ];

          // Fill in all the data
          _.each(data.members_data, function(member_data, index) {
            // Weekly points
            data.graphs_data.line.push({
              visible: member_data.selected,
              name: member_data.name,
              data: member_data.line_data,
              color: member_data.color,
              yAxis: 0,
              showInLegend: member_data.showInLegend
            });

            _.each(member_data.polar_data, function(polar_data, index) {
                data.graphs_data.polar[0].data[index].y += polar_data.y || 0;
             });

             data.graphs_data.polar.push({
               visible: member_data.selected,
               name: member_data.name,
               data: member_data.polar_data,
               color: member_data.color,
               showInLegend: member_data.showInLegend
             });
          });

          // Update the average %
          data.graphs_data.polar[0].data = _.map(data.graphs_data.polar[0].data, function(polar_data) {
            return {y: polar_data.y / data.members_data.length};
          });


          createLineChart(data, guild);
          createPolarChart(data, guild);

          data.first_line_graph_load = false;
          vm.data = data;
          vm.guild = guild;
        }

        function createLineChart(data, guild) {
          $('#line__'+guild.id).highcharts({
            chart: { type: 'spline', animation: data.first_line_graph_load },
            title: { text: 'Feedback punten ' + guild.name },
            // subtitle: { text}
            xAxis: { categories: data.horizontal_axis },
            yAxis: [
              { title: { text: 'Punten'}, minorGridLineWidth: 0, gridLineWidth: 1, alternateGridColor: null },
              { title: { text: 'Totaal aantal punten'}, minorGridLineWidth: 0, gridLineWidth: 1, alternateGridColor: null, opposite: true}
            ],
            tooltip: { shared: true, pointFormat: '{series.name} <strong>{point.y:,.0f}</strong><br>'},
            plotOptions: {
              spline: { lineWidth: 4, marker: { enabled: true, symbol: 'circle' }},
              series: { animation: data.first_line_graph_load, events: { legendItemClick:function() { return false }} },
            },
            series: data.graphs_data.line,
            exporting: { filename: guild.name + '_' + moment().format("DD/MM/YY HH:mm") },
            credits: { href: null, text: moment().format("DD/MM/YY HH:mm") }
          });
        }

        function createPolarChart(data, guild) {
          $('#polar__'+guild.id).highcharts({
            chart: { polar: true, type: 'spline' },
            title: { text: 'Feedback focus ' + guild.name },
            xAxis: {
              categories: ['Houding', 'Functioneren binnen de groep', 'Kennisontwikkeling', 'Verantwoording'],
              tickmarkPlacement: 'on',
              lineWidth: 0
            },
            yAxis: { gridLineInterpolation: 'polygon', visible: false},
            tooltip: { shared: true, pointFormat: '{series.name}: <strong>{point.y:,.0f}%</strong> <br>' },
            plotOptions: {
              series: { animation: data.first_line_graph_load, events: { legendItemClick: function() { return false; } } },
              spline: { lineWidth: 4, marker: { enabled: false }}
            },
            series: data.graphs_data.polar,
            exporting: { filename: guild.name + '_' + moment().format("DD/MM/YY HH:mm") },
            credits: { href: null, text: moment().format("DD/MM/YY HH:mm") }
          });
        }

    }
}());
