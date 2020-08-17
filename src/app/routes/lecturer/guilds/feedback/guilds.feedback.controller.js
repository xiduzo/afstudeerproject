(function() {
  'use strict';

  angular.module('cmd.guilds').controller('GuildDetailFeedbackController', GuildDetailFeedbackController);

  /** @ngInject */
  function GuildDetailFeedbackController(
    $stateParams,
    $filter,
    $translate,
    Global,
    Guild,
    toastr,
    localStorageService,
    LECTURER_ACCESS_LEVEL,
    COLORS,
    MAX_STAR_RATING
  ) {
    if (Global.getAccess() < LECTURER_ACCESS_LEVEL) {
      return Global.notAllowed();
    }

    Global.setRouteTitle($translate.instant('TEAM') + ' ' + $translate.instant('FEEDBACK').toLowerCase());
    Global.setRouteBackRoute('base.home.dashboards.lecturer');

    var vm = this;
    var PIE_COLORS = [ '#e91e63', '#3f51b5', '#00bcd4', '#795548' ];

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
    vm.language = Global.getLanguage();

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

        Global.setRouteTitle(
          $translate.instant('TEAM') + ' ' + $translate.instant('FEEDBACK').toLowerCase() + ' ' + guild.name
        );
        // Get endorsements from the localstorage
        if (
          _.findWhere(local_guilds, { guild: guild.id }) &&
          moment(_.findWhere(local_guilds, { guild: guild.id }).datetime).isAfter(moment().subtract(1, 'hours'))
        ) {
          guild.rules = _.findWhere(local_guilds, { guild: guild.id }).rules;
          prepareChartData(guild);
        } else {
          Guild.V2getGuildRules(guild.id)
            .then(function(response) {
              local_guilds = localStorageService.get('guilds') || [];
              var local_guild = _.findWhere(local_guilds, { guild: guild.id });
              var tempObj = {
                guild: guild.id,
                datetime: moment(),
                rules: response.data,
              };

              // Check if we need to update the local storage
              if (local_guild) {
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
              { type: 1, points: 0, max: 0, y: 0 },
              { type: 2, points: 0, max: 0, y: 0 },
              { type: 3, points: 0, max: 0, y: 0 },
              { type: 4, points: 0, max: 0, y: 0 },
            ],
            selected: true,
            showInLegend: true,
          };
        }),
        first_line_graph_load: true,
        horizontal_axis: [],
        endorsed_rules: [],
      };

      for (var index = 0; index <= guild.world.course_duration - 1; index++) {
        // Only show weeks that have been in the past
        if (!moment().isBefore(moment(guild.world.start).add(index, 'weeks'), 'day')) {
          var lineObject = { y: 0, max: 0, points: 0, average: 0 };
          data.graphs_data.line.push(lineObject);
          data.horizontal_axis.push('Week ' + (index + 1));

          // Add basis statistics for the users per week
          _.each(data.members_data, function(member) {
            member.line_data.push(lineObject);
            member.line_data_total.push(lineObject);
          });
        }

        if (
          moment().isBetween(
            moment(guild.world.start).add(index, 'weeks'),
            moment(guild.world.start).add(index, 'weeks').add(6, 'days'),
            'day'
          )
        ) {
          guild.current_week = {
            start: moment(guild.world.start).add(index, 'weeks'),
            end: moment(guild.world.start).add(index, 'weeks').add(6, 'days'),
          };
        }
      }

      setTimeout(function() {
        processData(data, guild);
      }, 100);
    }

    function processData(data, guild) {
      data.horizontal_axis.forEach(function(week, weekNum) {
        guild.members.forEach(function(member) {
          var dataMember = data.members_data.find(function(memberData) {
            return memberData.id === member.user.id;
          });

          var weekly_points_earned = 0;
          var weekly_max_points = 0;

          guild.rules.forEach(function(rule) {
            var polar_data = dataMember.polar_data.find(function(data) {
              return data.type === rule.rule_type;
            });

            guild.members
              .filter(function(filterMember) {
                return member.user.id !== filterMember.user.id;
              })
              .forEach(function(otherMember) {
                // Check if the other user has given feedback
                var feedback = rule.endorsements.find(function(endorsement) {
                  return (
                    endorsement.week === weekNum &&
                    endorsement.endorsed_by === otherMember.user.id &&
                    endorsement.user === member.user.id
                  );
                });

                // Check if you also gave feedback
                var givenFeedback = rule.endorsements.find(function(endorsement) {
                  return (
                    endorsement.week === weekNum &&
                    endorsement.endorsed_by === member.user.id &&
                    endorsement.user === otherMember.user.id
                  );
                });

                // Only add points when we gave feedback ourselves
                if (givenFeedback) {
                  // If we received feedback
                  var points_earned = 0;
                  if (feedback) {
                    points_earned = rule.points * feedback.rating;
                  } else {
                    // Gain full points for this week
                    points_earned = rule.points * MAX_STAR_RATING;
                  }

                  weekly_points_earned += points_earned;
                  polar_data.points += points_earned;
                }

                // Always add the max points
                weekly_max_points += rule.points * MAX_STAR_RATING;
                polar_data.max += rule.points * MAX_STAR_RATING;
              });
          });

          /// Update line chart
          dataMember.line_data[weekNum] = {
            y: weekly_points_earned * 100 / weekly_max_points, // percentage,
            max: weekly_max_points,
            points: weekly_points_earned,
            average: 0,
          };
        });
      });

      reformatData(data, guild);
    }

    function reformatData(data, guild) {
      // Prepare the polar data
      data.graphs_data.polar = [
        {
          name: $translate.instant('AVERAGE'),
          visible: true,
          color: Highcharts.Color('#222222').setOpacity(0.1).get(),
          data: [ { y: 0 }, { y: 0 }, { y: 0 }, { y: 0 } ],
        },
      ];

      // Prepare the line data
      data.graphs_data.line = [
        {
          name: $translate.instant('AVERAGE'),
          data: _.map(data.members_data[0].line_data, function(line_data) {
            return { y: 0, total: 0, max: 0, points: 0, average: 0 };
          }),
          color: Highcharts.Color('#222222').setOpacity(0.5).get(),
        },
      ];

      _.each(data.members_data, function(member_data) {
        // POLAR CHART
        // Add the score in percentage per type
        _.each(member_data.polar_data, function(polar_data, endorsement_type) {
          if (polar_data.points) {
            polar_data.y = polar_data.points * 100 / polar_data.max;
            data.graphs_data.polar[0].data[endorsement_type].y += polar_data.y;
          }
        });

        // Push to the polar data
        data.graphs_data.polar.push({
          visible: member_data.selected,
          name: member_data.name,
          data: member_data.polar_data,
          color: member_data.color,
          showInLegend: member_data.showInLegend,
        });

        // LINE CHART
        _.each(member_data.line_data, function(line_data, week) {
          if (week === 0) {
            line_data.average = line_data.y;
          } else {
            line_data.average = (member_data.line_data[week - 1].average + line_data.y) / 2;
          }

          // for the average chart
          data.graphs_data.line[0].data[week].y += line_data.y;
          data.graphs_data.line[0].data[week].average += line_data.average;
        });

        // Weekly line member
        data.graphs_data.line.push({
          visible: member_data.selected,
          name: member_data.name,
          data: member_data.line_data,
          color: member_data.color,
          showInLegend: member_data.showInLegend,
        });

        // Overall line member
        data.graphs_data.line.push({
          visible: member_data.selected,
          name: member_data.name,
          data: _.map(member_data.line_data, function(line_data) {
            return line_data.average;
          }),
          color: Highcharts.Color(member_data.color).setOpacity(0.33).get(),
          dashStyle: 'shortdot',
          enableMouseTracking: false,
          showInLegend: false,
        });
      });

      // Update the average score for the polar chart
      data.graphs_data.polar[0].data = _.map(data.graphs_data.polar[0].data, function(polar_data) {
        return {
          y: polar_data.y / data.members_data.length,
        };
      });

      // update the average score for the line chart
      data.graphs_data.line[0].data = _.map(data.graphs_data.line[0].data, function(line_data) {
        return {
          y: line_data.y / data.members_data.length,
          average: line_data.average / data.members_data.length,
        };
      });

      // Overall line gemiddelde
      data.graphs_data.line.push({
        name: $translate.instant('AVERAGE'),
        data: _.map(data.graphs_data.line[0].data, function(line_data) {
          return line_data.average;
        }),
        color: Highcharts.Color('#222222').setOpacity(0.1).get(),
        dashStyle: 'shortdot',
        enableMouseTracking: false,
        showInLegend: false,
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
        title: { text: $translate.instant('FEEDBACK') + ' ' + guild.name },
        xAxis: { categories: data.horizontal_axis },
        yAxis: [
          {
            title: { text: $translate.instant('POINT_PERCENTAGE') },
            minorGridLineWidth: 0,
            gridLineWidth: 1,
            alternateGridColor: null,
            min: 0,
            max: 100,
          },
          // { title: { text: 'Overall percentage'}, minorGridLineWidth: 0, gridLineWidth: 1, alternateGridColor: null, min:0, max: 100, opposite: true}
        ],
        tooltip: {
          shared: true,
          pointFormat: '{series.name} <strong>{point.y:,.0f}%</strong> <em>({point.average:,.0f}% overall)</em><br>',
        },
        plotOptions: {
          spline: { lineWidth: 4, marker: { enabled: true, symbol: 'circle' } },
          series: {
            animation: data.first_line_graph_load,
            events: {
              legendItemClick: function() {
                return false;
              },
            },
          },
        },
        series: data.graphs_data.line,
        exporting: {
          filename: guild.name + '_' + moment().format('DD/MM/YY HH:mm'),
        },
        credits: { href: null, text: moment().format('DD/MM/YY HH:mm') },
      });
    }

    function createPolarChart(data, guild) {
      $('#polar').highcharts({
        chart: { polar: true, type: 'spline' },
        title: { text: 'Feedback focus ' + guild.name },
        xAxis: {
          categories: [
            $translate.instant('ATTITUDE'),
            $translate.instant('FUNCTIONING_IN_TEAM'),
            $translate.instant('KNOWLEDGE_DEVELOPMENT'),
            $translate.instant('ACCOUNTABILITY'),
          ],
          tickmarkPlacement: 'on',
          lineWidth: 0,
        },
        yAxis: {
          gridLineInterpolation: 'polygon',
          visible: false,
          min: 0,
          max: 100,
        },
        tooltip: {
          shared: true,
          pointFormat: '{series.name}: <strong>{point.y:,.0f}%</strong> <br>',
        },
        plotOptions: {
          series: {
            animation: data.first_line_graph_load,
            events: {
              legendItemClick: function() {
                return false;
              },
            },
          },
          spline: { lineWidth: 4, marker: { enabled: false } },
        },
        series: data.graphs_data.polar,
        exporting: {
          filename: guild.name + '_' + moment().format('DD/MM/YY HH:mm'),
        },
        credits: { href: null, text: moment().format('DD/MM/YY HH:mm') },
      });
    }

    function buildPieData(data, guild) {
      createPieChart(guild);
    }

    function createPieChart(guild) {
      var totalPoints = guild.rules.reduce(function(sum, rule) {
        var points_given = rule.endorsements.reduce(function(s, endorsement) {
          s += endorsement.rating * rule.points / MAX_STAR_RATING;
          return s;
        }, 0);
        sum += points_given;
        return sum;
      }, 0);

      var data = [ 1, 2, 3, 4 ].map(function(item, index) {
        var categories = guild.rules
          .filter(function(rule) {
            return rule.rule_type === item;
          })
          .map(function(rule) {
            return vm.language === 'nl-NL' ? rule.rule : rule.rule_eng;
          })
          .sort();
        var points = guild.rules
          .filter(function(rule) {
            return rule.rule_type === item;
          })
          .reduce(function(sum, rule) {
            if (rule.rule_type !== item) {
              return sum;
            }
            var points_given = rule.endorsements.reduce(function(s, endorsement) {
              s += endorsement.rating * rule.points / MAX_STAR_RATING;
              return s;
            }, 0);
            sum += points_given;
            return sum;
          }, 0);

        var max_points = guild.rules
          .filter(function(rule) {
            return rule.rule_type === item;
          })
          .reduce(function(sum, rule) {
            if (rule.rule_type !== item) {
              return sum;
            }
            var points_given = rule.endorsements.reduce(function(s, endorsement) {
              s += endorsement.rating * MAX_STAR_RATING;
              return s;
            }, 0);
            sum += points_given;
            return sum;
          }, 0);

        return {
          y: points,
          points: points,
          max: max_points,
          percentage: points * 100 / totalPoints,
          color: PIE_COLORS[parseInt(index)],
          drilldown: {
            name: item,
            categories: categories,
            data: guild.rules
              .filter(function(rule) {
                return rule.rule_type === item;
              })
              .reduce(
                function(sum, rule) {
                  var points_given = rule.endorsements.reduce(function(s, endorsement) {
                    s += endorsement.rating * rule.points / MAX_STAR_RATING;
                    return s;
                  }, 0);
                  sum[categories.indexOf(vm.language === 'nl-NL' ? rule.rule : rule.rule_eng)] += points_given;
                  return sum;
                },
                Array.from({ length: categories.length }).map(function() {
                  return 0;
                })
              ),
          },
        };
      });
      var ruleTypes = [];
      var endorsements = [];
      var categories = [
        $translate.instant('FUNCTIONING_IN_TEAM'),
        $translate.instant('ATTITUDE'),
        $translate.instant('KNOWLEDGE_DEVELOPMENT'),
        $translate.instant('ACCOUNTABILITY'),
      ];
      for (var i = 0; i < data.length; i++) {
        // add browser data
        ruleTypes.push({
          name: categories[i],
          y: data[i].y,
          color: data[i].color,
        });

        // add version data
        var drillDataLen = data[i].drilldown.data.length;
        for (var j = 0; j < drillDataLen; j++) {
          var brightness = 0.2 - j / drillDataLen / 5;
          endorsements.push({
            name: data[i].drilldown.categories[j],
            y: data[i].drilldown.data[j],
            color: Highcharts.Color(data[i].color).brighten(brightness).get(),
          });
        }
      }
      $('#pie').highcharts({
        chart: { type: 'pie', animation: false },
        title: { text: 'Feedback focus ' + guild.name },
        subtitle: { text: 'als percentage van gegeven punten' },
        tooltip: {
          pointFormat: '<b>{point.percentage:,.2f}%',
        },
        plotOptions: {
          pie: { shadow: false, center: [ '50%', '50%' ] },
          allowPointSelect: false,
        },
        series: [
          {
            name: 'Rule types',
            data: ruleTypes,
            size: '60%',
            dataLabels: {
              formatter: function() {
                return null;
              },
              color: '#ffffff',
              distance: -30,
            },
          },
          {
            name: 'Endorsements',
            data: endorsements,
            size: '80%',
            innerSize: '60%',
            dataLabels: {
              distance: 10,
              formatter: function() {
                // display only if larger than 1
                return this.point.y > 0 ? this.point.name : null; //TODO make `categories` unique
              },
              style: {
                fontSize: '10px',
                fontWeight: 'light',
              },
            },
          },
        ],
        exporting: { enabled: false, filename: guild.name + '_' + moment() },
        credits: { href: '', text: '' },
      });
    }

    function selectMember(member) {
      member.selected = !member.selected;

      _.each(vm.data.members_data, function(member, index) {
        vm.data.graphs_data.line[index + 1] = {
          visible: member.selected,
          name: member.name,
          data: member.line_data,
          color: member.color,
          yAxis: 0,
        };

        vm.data.graphs_data.line[index + 1 + vm.data.members_data.length] = {
          visible: member.selected,
          name: member.name,
          data: _.map(member.line_data, function(line_data) {
            return line_data.average;
          }),
          color: Highcharts.Color(member.color).setOpacity(0.33).get(),
          //yAxis: 1,
          dashStyle: 'shortdot',
          enableMouseTracking: false,
          showInLegend: false,
        };

        vm.data.graphs_data.polar[index + 1] = {
          visible: member.selected,
          name: member.name,
          data: member.polar_data,
          color: member.color,
        };
      });

      createLineChart(vm.data, vm.guild);
      createPolarChart(vm.data, vm.guild);
      buildPieData(vm.data, vm.guild);
    }
  }
})();
