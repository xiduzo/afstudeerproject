;(function() {
  'use strict'

  angular
    .module('cmd.guilds')
    .controller('GuildDetailFeedbackController', GuildDetailFeedbackController)

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
    if (Global.getAccess() < LECTURER_ACCESS_LEVEL) {
      return Global.notAllowed()
    }

    Global.setRouteTitle('Team feedback')
    Global.setRouteBackRoute('base.home.dashboards.lecturer')

    var vm = this

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    // vm.buildChartData = buildChartData;
    vm.selectMember = selectMember

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    vm.user = Global.getUser()
    vm.access = Global.getAccess()

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    function roundToTwo(num) {
      return parseFloat(num.toFixed(2))
    }

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    Guild.getGuild($stateParams.guildUuid)
      .then(function(response) {
        vm.loading_page = false

        var guild = response
        var local_guilds = localStorageService.get('guilds') || []

        Global.setRouteTitle('Team feedback ' + guild.name)

        // Get endorsements from the localstorage
        if (
          _.findWhere(local_guilds, { guild: guild.id }) &&
          moment(_.findWhere(local_guilds, { guild: guild.id }).datetime).isAfter(
            moment().subtract(1, 'hours')
          )
        ) {
          guild.rules = _.findWhere(local_guilds, { guild: guild.id }).rules
          prepareChartData(guild)
        } else {
          Guild.V2getGuildRules(guild.id)
            .then(function(response) {
              local_guilds = localStorageService.get('guilds') || []
              var local_guild = _.findWhere(local_guilds, { guild: guild.id })
              var tempObj = {
                guild: guild.id,
                datetime: moment(),
                rules: response.data,
              }

              // Check if we need to update the local storage
              if (local_guild) {
                local_guilds[_.indexOf(local_guilds, local_guild)] = tempObj
              } else {
                local_guilds.push(tempObj)
              }

              localStorageService.set('guilds', local_guilds)

              guild.rules = response.data

              prepareChartData(guild)
            })
            .catch(function(error) {
              toastr.error(error)
            })
        }
      })
      .catch(function(error) {
        toastr.error(error)
      })

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
          }
        }),
        first_line_graph_load: true,
        horizontal_axis: [],
        endorsed_rules: [],
      }

      for (var index = 0; index <= guild.world.course_duration - 1; index++) {
        // Only show weeks that have been in the past
        if (!moment().isBefore(moment(guild.world.start).add(index, 'weeks'), 'day')) {
          var lineObject = { y: 0, max: 0, points: 0, average: 0 }
          data.graphs_data.line.push(lineObject)
          data.horizontal_axis.push('Week ' + (index + 1))

          // Add basis statistics for the users per week
          _.each(data.members_data, function(member) {
            member.line_data.push(lineObject)
            member.line_data_total.push(lineObject)
          })
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
          }
        }
      }

      setTimeout(function() {
        processData(data, guild)
      }, 100)
    }

    function processData(data, guild) {
      data.horizontal_axis.forEach(function(week, weekNum) {
        guild.members.forEach(function(member) {
          var dataMember = data.members_data.find(function(memberData) {
            return memberData.id === member.user.id
          })

          var weekly_points_earned = 0
          var weekly_max_points = 0

          guild.rules.forEach(function(rule) {
            var polar_data = dataMember.polar_data.find(function(data) {
              return data.type === rule.rule_type
            })

            guild.members
              .filter(function(filterMember) {
                return member.user.id !== filterMember.user.id
              })
              .forEach(function(otherMember) {
                // Check if the other user has given feedback
                var feedback = rule.endorsements.find(function(endorsement) {
                  return (
                    endorsement.week === weekNum + 1 &&
                    endorsement.endorsed_by === otherMember.user.id &&
                    endorsement.user === member.user.id
                  )
                })

                // Check if you also gave feedback
                var givenFeedback = rule.endorsements.find(function(endorsement) {
                  return (
                    endorsement.week === weekNum + 1 &&
                    endorsement.endorsed_by === member.user.id &&
                    endorsement.user === otherMember.user.id
                  )
                })

                // Only add points when we gave feedback ourselves
                if (givenFeedback) {
                  // If we received feedback
                  var points_earned = 0
                  if (feedback) {
                    points_earned = rule.points * feedback.rating
                  } else {
                    // Gain full points for this week
                    points_earned = rule.points * MAX_STAR_RATING
                  }

                  weekly_points_earned += points_earned
                  polar_data.points += points_earned
                }

                // Always add the max points
                weekly_max_points += rule.points * MAX_STAR_RATING
                polar_data.max += rule.points * MAX_STAR_RATING
              })
          })

          /// Update line chart
          dataMember.line_data[weekNum] = {
            y: weekly_points_earned * 100 / weekly_max_points, // percentage,
            max: weekly_max_points,
            points: weekly_points_earned,
            average: 0,
          }
        })
      })

      reformatData(data, guild)
    }

    function reformatData(data, guild) {
      // Prepare the polar data
      data.graphs_data.polar = [
        {
          name: 'Gemiddeld',
          visible: true,
          color: Highcharts.Color('#222222').setOpacity(0.1).get(),
          data: [ { y: 0 }, { y: 0 }, { y: 0 }, { y: 0 } ],
        },
      ]

      // Prepare the line data
      data.graphs_data.line = [
        {
          name: 'Gemiddeld',
          data: _.map(data.members_data[0].line_data, function(line_data) {
            return { y: 0, total: 0, max: 0, points: 0, average: 0 }
          }),
          color: Highcharts.Color('#222222').setOpacity(0.5).get(),
        },
      ]

      _.each(data.members_data, function(member_data) {
        // POLAR CHART
        // Add the score in percentage per type
        _.each(member_data.polar_data, function(polar_data, endorsement_type) {
          if (polar_data.points) {
            polar_data.y = polar_data.points * 100 / polar_data.max
            data.graphs_data.polar[0].data[endorsement_type].y += polar_data.y
          }
        })

        // Push to the polar data
        data.graphs_data.polar.push({
          visible: member_data.selected,
          name: member_data.name,
          data: member_data.polar_data,
          color: member_data.color,
          showInLegend: member_data.showInLegend,
        })

        // LINE CHART
        _.each(member_data.line_data, function(line_data, week) {
          if (week === 0) {
            line_data.average = line_data.y
          } else {
            line_data.average = (member_data.line_data[week - 1].average + line_data.y) / 2
          }

          // for the average chart
          data.graphs_data.line[0].data[week].y += line_data.y
          data.graphs_data.line[0].data[week].average += line_data.average
        })

        // Weekly line member
        data.graphs_data.line.push({
          visible: member_data.selected,
          name: member_data.name,
          data: member_data.line_data,
          color: member_data.color,
          showInLegend: member_data.showInLegend,
        })

        // Overall line member
        data.graphs_data.line.push({
          visible: member_data.selected,
          name: member_data.name,
          data: _.map(member_data.line_data, function(line_data) {
            return line_data.average
          }),
          color: Highcharts.Color(member_data.color).setOpacity(0.33).get(),
          dashStyle: 'shortdot',
          enableMouseTracking: false,
          showInLegend: false,
        })
      })

      // Update the average score for the polar chart
      data.graphs_data.polar[0].data = _.map(data.graphs_data.polar[0].data, function(polar_data) {
        return {
          y: polar_data.y / data.members_data.length,
        }
      })

      // update the average score for the line chart
      data.graphs_data.line[0].data = _.map(data.graphs_data.line[0].data, function(line_data) {
        return {
          y: line_data.y / data.members_data.length,
          average: line_data.average / data.members_data.length,
        }
      })

      // Overall line gemiddelde
      data.graphs_data.line.push({
        name: 'Gemiddeld',
        data: _.map(data.graphs_data.line[0].data, function(line_data) {
          return line_data.average
        }),
        color: Highcharts.Color('#222222').setOpacity(0.1).get(),
        dashStyle: 'shortdot',
        enableMouseTracking: false,
        showInLegend: false,
      })

      createLineChart(data, guild)
      createPolarChart(data, guild)

      data.first_line_graph_load = false
      vm.data = data
      vm.guild = guild
    }

    function createLineChart(data, guild) {
      $('#chart').highcharts({
        chart: { type: 'spline', animation: data.first_line_graph_load },
        title: { text: 'Feedback ' + guild.name },
        xAxis: { categories: data.horizontal_axis },
        yAxis: [
          {
            title: { text: 'Punten percentage' },
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
          pointFormat:
            '{series.name} <strong>{point.y:,.0f}%</strong> <em>({point.average:,.0f}% overall)</em><br>',
        },
        plotOptions: {
          spline: { lineWidth: 4, marker: { enabled: true, symbol: 'circle' } },
          series: {
            animation: data.first_line_graph_load,
            events: {
              legendItemClick: function() {
                return false
              },
            },
          },
        },
        series: data.graphs_data.line,
        exporting: { filename: guild.name + '_' + moment().format('DD/MM/YY HH:mm') },
        credits: { href: null, text: moment().format('DD/MM/YY HH:mm') },
      })
    }

    function createPolarChart(data, guild) {
      $('#polar').highcharts({
        chart: { polar: true, type: 'spline' },
        title: { text: 'Feedback focus ' + guild.name },
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
        yAxis: { gridLineInterpolation: 'polygon', visible: false, min: 0, max: 100 },
        tooltip: {
          shared: true,
          pointFormat: '{series.name}: <strong>{point.y:,.0f}%</strong> <br>',
        },
        plotOptions: {
          series: {
            animation: data.first_line_graph_load,
            events: {
              legendItemClick: function() {
                return false
              },
            },
          },
          spline: { lineWidth: 4, marker: { enabled: false } },
        },
        series: data.graphs_data.polar,
        exporting: { filename: guild.name + '_' + moment().format('DD/MM/YY HH:mm') },
        credits: { href: null, text: moment().format('DD/MM/YY HH:mm') },
      })
    }

    function buildPieData(data, guild) {
      var pie_data = _.groupBy(guild.rules, function(rule) {
        return rule.rule_type
      })
      var series = [
        {
          name: 'Type',
          size: '85%',
          data: [],
          dataLabels: {
            formatter: function() {
              return null
            },
          },
          showInLegend: true,
        },
        {
          name: 'Rules',
          size: '100%',
          innerSize: '85%',
          data: [],
          dataLabels: {
            formatter: function() {
              return null
            },
          },
        },
      ]

      var selected_users = _.filter(data.members_data, { selected: true })

      _.each(pie_data, function(pie_piece, index) {
        var name = ''
        var pie_piece_points = { max: 0, total: 0 }
        var total_points = 0
        var PIE_COLORS = [ '#2196F3', '#E91E63', '#FFEB3B', '#FF9800' ]

        switch (pie_piece[0].rule_type) {
          case 1:
            name = 'Houding'
            break
          case 2:
            name = 'Functioneren binnen<br/>de groep'
            break
          case 3:
            name = 'Kennisontwikkeling'
            break
          case 4:
            name = 'Verantwoording'
            break
        }

        _.each(pie_piece, function(rule, rule_number) {
          var rule_points = _.reduce(
            rule.endorsements,
            function(memo, endorsement) {
              if (_.findWhere(selected_users, { id: endorsement.user })) {
                memo.max += endorsement.rule_points
                memo.total += endorsement.rating * endorsement.rule_points / MAX_STAR_RATING
                total_points += endorsement.rule_points
              }
              return memo
            },
            { total: 0, max: 0 }
          )

          pie_piece_points.max += rule_points.max
          pie_piece_points.total += rule_points.total
        })

        // TODO
        // Find a way in which you dont need this double _.each loop
        _.each(pie_piece, function(rule, rule_number) {
          var rule_points = _.reduce(
            rule.endorsements,
            function(memo, endorsement) {
              if (_.findWhere(selected_users, { id: endorsement.user })) {
                memo.max += endorsement.rule_points
                memo.total += endorsement.rating * endorsement.rule_points / MAX_STAR_RATING
              }
              return memo
            },
            { total: 0, max: 0 }
          )

          series[1].data.push({
            name: rule.rule,
            color: Highcharts.Color(PIE_COLORS[parseInt(index) - 1])
              .setOpacity(1 - 0.125 * rule_number)
              .get(),
            y:
              pie_piece_points.total *
              100 /
              total_points *
              rule_points.total /
              pie_piece_points.total,
            points: rule_points.total,
            procent: rule_points.total * 100 / rule_points.max,
            max: rule_points.max,
          })
        })

        series[0].data.push({
          name: name,
          color: PIE_COLORS[parseInt(index) - 1],
          y: pie_piece_points.total * 100 / total_points,
          points: pie_piece_points.total,
          procent: pie_piece_points.total * 100 / pie_piece_points.max,
          max: pie_piece_points.max,
        })
      })
      createPieChart(series, data, guild)
    }

    function createPieChart(series, data, guild) {
      $('#pie').highcharts({
        chart: { type: 'pie' },
        title: { text: 'Feedback focus ' + guild.name },
        subtitle: { text: 'Punten percentage van gegeven punten' },
        tooltip: {
          pointFormat: '<b>{point.procent:,.2f}%</b> ({point.points:,.0f}/{point.max:,.0f})',
        },
        plotOptions: {
          series: { animation: data.first_line_graph_load },
          pie: { shadow: false, center: [ '50%', '50%' ] },
          allowPointSelect: false,
        },
        series: series,
        exporting: { enabled: false, filename: guild.name + '_' + moment() },
        credits: { href: '', text: '' },
      })
    }

    function selectMember(member) {
      member.selected = !member.selected

      _.each(vm.data.members_data, function(member, index) {
        vm.data.graphs_data.line[index + 1] = {
          visible: member.selected,
          name: member.name,
          data: member.line_data,
          color: member.color,
          yAxis: 0,
        }

        vm.data.graphs_data.line[index + 1 + vm.data.members_data.length] = {
          visible: member.selected,
          name: member.name,
          data: _.map(member.line_data, function(line_data) {
            return line_data.average
          }),
          color: Highcharts.Color(member.color).setOpacity(0.33).get(),
          //yAxis: 1,
          dashStyle: 'shortdot',
          enableMouseTracking: false,
          showInLegend: false,
        }

        vm.data.graphs_data.polar[index + 1] = {
          visible: member.selected,
          name: member.name,
          data: member.polar_data,
          color: member.color,
        }
      })

      createLineChart(vm.data, vm.guild)
      createPolarChart(vm.data, vm.guild)
      //buildPieData(vm.data, vm.guild);
    }
  }
})()
