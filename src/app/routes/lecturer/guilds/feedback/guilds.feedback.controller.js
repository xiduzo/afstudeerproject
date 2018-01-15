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
        toastr,
        localStorageService,
        LECTURER_ACCESS_LEVEL,
        COLORS,
        MAX_STAR_RATING
    ) {

        if(Global.getAccess() < LECTURER_ACCESS_LEVEL) {
            return Global.notAllowed();
        }

        Global.setRouteTitle('Team feedback');
        Global.setRouteBackRoute('base.home.dashboards.lecturer');

        var vm = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        // vm.buildChartData = buildChartData;
        vm.selectMember = selectMember;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        vm.user = Global.getUser();
        vm.access = Global.getAccess();

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function roundToTwo(num) {
            return parseFloat(num.toFixed(2));
        }

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getGuild($stateParams.guildUuid)
        .then(function(response) {
          vm.loading_page = false;

          var guild = response;
          var local_guilds = localStorageService.get('guilds') || [];

          Global.setRouteTitle('Team feedback ' + guild.name);

          // Get endorsements from the localstorage
          if(_.findWhere(local_guilds, {guild: guild.id}) && moment(_.findWhere(local_guilds, {guild: guild.id}).datetime).isAfter(moment().subtract(1, 'hours'))) {
            guild.rules = _.findWhere(local_guilds, {guild: guild.id}).rules;
            prepareChartData(guild);
          } else {
            Guild.V2getGuildRules(guild.id)
            .then(function(response) {
              local_guilds = localStorageService.get('guilds') || [];
              var local_guild = _.findWhere(local_guilds, {guild: guild.id});
              var tempObj = {
                guild: guild.id,
                datetime: moment(),
                rules: response.data
              };

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

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function prepareChartData(guild) {
          var data = {
            graphs_data: { line: [], line_total: [], polar: [] },
            members_data: _.map(guild.members, function(member, index) {
              return {
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
                selected: true
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
              data.graphs_data.line_total.push(0);
              data.horizontal_axis.push('Week ' + (index+1));

              // Add basis statistics for the users per week
              // Add basis statistics for the users per week
              _.each(data.members_data, function(member) {
                member.line_data.push({y: 0, total: 0});
                member.line_data_total.push(0);
              });
            }
          }

          processData(data, guild);

        }

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
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
            var week = 0;

            // console.log(member.endorsements);
            _.each(member.endorsements, function(endorsements) {
              // Group the endorsements by type
              endorsements = _.groupBy(endorsements, function(endorsement) {
                return endorsement.rule_type;
              });

              var points = 0; // Set the local points to 0 to calculate % later on

              _.each(endorsements, function(endorsement_type, index) {
                _.each(endorsement_type, function(endorsement) {

                  var endorsed_rule = _.findWhere(data.endorsed_rules, { id: endorsement.rule });
                  var endorsement_points = endorsement.rating * endorsement.rule_points / MAX_STAR_RATING;
                  // build up the endorsement rules circles
                  // TODO: fix all the missing endorsements
                  if(endorsed_rule) {
                    endorsed_rule.total_points += endorsement.rule_points;
                    endorsed_rule.points += endorsement.rating * endorsement.rule_points / MAX_STAR_RATING;
                  } else {
                    data.endorsed_rules.push({
                      id: endorsement.rule,
                      rule: endorsement.rule_name,
                      total_points: endorsement.rule_points,
                      points: endorsement_points
                    });
                  }

                  // Check if the user has given feedback before receiving points
                  var given_endorsement = _.findWhere(all_endorsements, { week: endorsement.week, user: endorsement.endorsed_by, endorsed_by: endorsement.user, rule: endorsement.rule });
                  if(given_endorsement) {
                    points += endorsement_points;
                    total_points += endorsement_points;
                    _.findWhere(member.polar_data, { type: endorsement.rule_type }).points += endorsement_points;
                  }

                  // For calculating the % of points gained on maximal points able to gain
                  _.findWhere(member.polar_data, { type: endorsement.rule_type }).total_points += endorsement.rule_points;

                });
              });

              member.line_data[week] = {
                  y: points,
                  total: total_points,
              };

              member.line_data_total[week] = total_points;

              week++;
            });

          });

          reformatData(data, guild);
        }

        function reformatData(data, guild) {

          _.each(data.members_data, function(members_data) {
            _.each(members_data.line_data, function(points, index) {
              if(points.y) { data.graphs_data.line[index] += points.y; }
            });
            _.each(members_data.line_data_total, function(points, index) {
              data.graphs_data.line_total[index] += points;
            });
          });

          // Make the average line
          data.graphs_data.line = [
            {
              name: 'Gemiddeld',
              data: _.map(data.graphs_data.line, function(line_data, index) {
                return { y: line_data / data.members_data.length, total: data.graphs_data.line_total[index] / data.members_data.length };
              }),
              color: Highcharts.Color('#222222').setOpacity(0.1).get(),
              yAxis: 0
            },
            {
                name: 'Gemiddeld totaal',
                // TODO
                // Cummulative total
                data: _.map(data.graphs_data.line_total, function(line_data, index) {
                  return line_data / data.members_data.length;
                }),
                color: Highcharts.Color('#222222').setOpacity(0.1).get(),
                yAxis: 1,
                dashStyle: 'shortdot',
                enableMouseTracking: false,
                showInLegend: false
            }
          ];

          // Prepare the polar data
          data.graphs_data.polar = [
            {
              name: 'Gemiddeld',
              visible: true,
              color: Highcharts.Color('#222222').setOpacity(0.1).get(),
              data: [0,0,0,0]
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
              yAxis: 0
            });

            // Total points
            data.graphs_data.line.push({
              visible: member_data.selected,
              name: member_data.name,
              data: member_data.line_data_total,
              color: Highcharts.Color(member_data.color).setOpacity(0.33).get(),
              yAxis: 1,
              dashStyle: 'shortdot',
              enableMouseTracking: false,
              showInLegend: false,
            });

            member_data.polar_data =_.map(member_data.polar_data, function(polar_data) {
              return (polar_data.points * 100 / polar_data.total_points) || 0;
            });

            _.each(member_data.polar_data, function(polar_data, index) {
                data.graphs_data.polar[0].data[index] += polar_data || 0;
             });

             data.graphs_data.polar.push({
               visible: member_data.selected,
               name: member_data.name,
               data: member_data.polar_data,
               color: member_data.color
             });
          });

          // Update the average %
          data.graphs_data.polar[0].data = _.map(data.graphs_data.polar[0].data, function(polar_data) {
            return polar_data / data.members_data.length;
          });


          createLineChart(data, guild);
          createPolarChart(data, guild);
          buildPieData(data, guild);

          data.first_line_graph_load = false;
          vm.data = data;
          vm.guild = guild;
        }

        function createLineChart(data, guild) {
          $('#chart').highcharts({
            chart: { type: 'spline', animation: data.first_line_graph_load },
            title: { text: 'Feedback punten ' + guild.name },
            // subtitle: { text}
            xAxis: { categories: data.horizontal_axis },
            yAxis: [
              { title: { text: 'Punten'}, minorGridLineWidth: 0, gridLineWidth: 1, alternateGridColor: null },
              { title: { text: 'Totaal aantal punten'}, minorGridLineWidth: 0, gridLineWidth: 1, alternateGridColor: null, opposite: true}
            ],
            tooltip: { shared: true, pointFormat: '{series.name} <strong>{point.y:,.0f}</strong> (totaal {point.total:,.0f}) <br>'},
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
          $('#polar').highcharts({
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

        function buildPieData(data, guild) {
          var pie_data = _.groupBy(guild.rules, function(rule) {
            return rule.rule_type;
          });
          var series = [
            {
              name: 'Type',
              size: '85%',
              data: [],
              dataLabels: { formatter: function () { return null; }, },
              showInLegend: true
            },
            {
              name: 'Rules',
              size: '100%',
              innerSize: '85%',
              data: [],
              dataLabels: { formatter: function () { return null; }, }
            }
          ];

          var selected_users = _.filter(data.members_data, { selected: true });

          _.each(pie_data, function(pie_piece, index) {
            var name = '';
            var pie_piece_points = { max: 0, total: 0};
            var total_points = 0;
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
                  memo.max += endorsement.rule_points;
                  memo.total += endorsement.rating * endorsement.rule_points / MAX_STAR_RATING;
                  total_points += endorsement.rule_points;
                }
                return memo;
              }, {total: 0, max: 0});

              pie_piece_points.max += rule_points.max;
              pie_piece_points.total += rule_points.total;
            });

            // TODO
            // Find a way in which you dont need this double _.each loop
            _.each(pie_piece, function(rule, rule_number) {
              var rule_points = _.reduce(rule.endorsements, function(memo, endorsement) {
                if(_.findWhere(selected_users, { id: endorsement.user })) {
                  memo.max += endorsement.rule_points;
                  memo.total += endorsement.rating * endorsement.rule_points / MAX_STAR_RATING;
                }
                return memo;
              }, {total: 0, max: 0});

              series[1].data.push({
                name: rule.rule,
                color: Highcharts.Color(PIE_COLORS[parseInt(index)-1]).setOpacity(1 - 0.125 * rule_number).get(),
                y: (pie_piece_points.total * 100 / total_points) * rule_points.total / pie_piece_points.total,
                points: rule_points.total,
                procent: rule_points.total * 100 / rule_points.max,
                max: rule_points.max,
              });
            });

            series[0].data.push({
              name: name,
              color: PIE_COLORS[parseInt(index)-1],
              y: pie_piece_points.total * 100 / total_points,
              points: pie_piece_points.total,
              procent: pie_piece_points.total * 100 / pie_piece_points.max,
              max: pie_piece_points.max
            });

          });
          createPieChart(series, data, guild);
        }

        function createPieChart(series, data, guild) {
            $('#pie').highcharts({
                chart: { type: 'pie' },
                title: { text: 'Feedback focus ' + guild.name, },
                subtitle: { text: 'Punten percentage van gegeven punten' },
                tooltip: { pointFormat: '<b>{point.procent:,.2f}%</b> ({point.points:,.0f}/{point.max:,.0f})' },
                plotOptions: {
                    series: { animation: data.first_line_graph_load, },
                    pie: { shadow: false, center: ['50%', '50%'], },
                    allowPointSelect: false,
                },
                series: series,
                exporting: { enabled: false, filename: guild.name + "_" + moment() },
                credits: { href: '', text: '' }
            });
        }

        function selectMember(member) {
            member.selected = !member.selected;

            _.each(vm.data.members_data, function(member, index) {
                vm.data.graphs_data.line[index + 2] = {
                    visible: member.selected,
                    name: member.name,
                    data: member.line_data,
                    color: member.color,
                    yAxis: 0
                };
                vm.data.graphs_data.line[index + 2 + vm.data.members_data.length] = {
                    visible: member.selected,
                    name: member.name,
                    data: member.line_data_total,
                    color: Highcharts.Color(member.color).setOpacity(0.33).get(),
                    yAxis: 1,
                    dashStyle: 'shortdot',
                    enableMouseTracking: false,
                    showInLegend: false
                };

                vm.data.graphs_data.polar[index + 1] = {
                    visible: member.selected,
                    name: member.name,
                    data: member.polar_data,
                    color: member.color
                };
            });

            createLineChart(vm.data, vm.guild);
            createPolarChart(vm.data, vm.guild);
            buildPieData(vm.data, vm.guild);
        }


    }
}());
