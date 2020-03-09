// TODO
// 2 tabs indentation everywhere, i'm sloppy... sue me
// xxx - Xiduzo

(function() {
  "use strict";

  angular.module("cmd.home").controller("StudentDashboardController", StudentDashboardController);

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
    $translate,
    localStorageService,
    STUDENT_ACCESS_LEVEL,
    COLORS,
    MAX_STAR_RATING
  ) {
    if (Global.getAccess() < STUDENT_ACCESS_LEVEL) {
      return Global.notAllowed();
    }

    Global.setRouteTitle("Dashboard");

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
    vm.user.trello = localStorageService.get("trello_user") ? true : false;
    vm.guilds = [];
    vm.loading_page = true;

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
             Broadcasts
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    $scope.$on("guild-changed", function(event, guild) {
      vm.selected_guild = guild;

      if (guild !== undefined) {
        if (!_.findWhere(vm.guilds, { id: guild })) {
          getGuildData(guild);
        } else {
          prepareChartData(_.findWhere(vm.guilds, { id: guild }));
        }
      }
    });

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
             Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
             Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    if (vm.selected_guild !== undefined && vm.selected_guild !== null) {
      getGuildData(vm.selected_guild);
    }

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    function gotoCard(card) {
      window.open(card.shortUrl);
    }

    function gotoBoard(board) {
      window.open("http://trello.com/b/" + board);
    }

    function getTrelloCards(guild) {
      if (!vm.user.trello) return;
      TrelloApi.Authenticate()
        .then(function() {
          TrelloApi.Rest("GET", "boards/" + guild.trello_board + "/cards")
            .then(function(response) {
              // We don't care about cards that have been done allready
              var cards = _.filter(response, function(card) {
                return card.idList !== guild.trello_done_list;
              });

              // Only return cards where you are one of the members
              cards = _.filter(cards, function(card) {
                return _.contains(card.idMembers, vm.user.trello.id);
              });

              // Add the created_at on the card b/c trello won't give this to us
              _.each(cards, function(card) {
                card.created_at = moment(new Date(1000 * parseInt(card.id.substring(0, 8), 16)));
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
          var local_guilds = localStorageService.get("guilds") || [];

          guild.world.end = moment(guild.world.start)
            .add(guild.world.course_duration, "weeks")
            .add(6, "days");
          if (
            moment().isAfter(
              moment(guild.world.start)
                .add(guild.world.course_duration, "weeks")
                .add(6, "days"),
              "day"
            )
          ) {
            guild.ended = true;
          }

          // Check for trello
          if (!guild.trello_done_list || !guild.trello_board) {
            // guild.trello_not_configured = true
          } else {
            getTrelloCards(guild);
          }

          vm.guilds.push(guild);

          // Get endorsements from the localstorage
          if (
            _.findWhere(local_guilds, { guild: guild.id }) &&
            moment(_.findWhere(local_guilds, { guild: guild.id }).datetime).isAfter(
              moment().subtract(1, "hours")
            )
          ) {
            guild.rules = _.findWhere(local_guilds, { guild: guild.id }).rules;
            prepareChartData(guild);
          } else {
            Guild.V2getGuildRules(guild.id)
              .then(function(response) {
                local_guilds = localStorageService.get("guilds") || [];
                var local_guild = _.findWhere(local_guilds, { guild: guild.id });
                var tempObj = { guild: guild.id, datetime: moment(), rules: response.data };

                // Check if we need to update the local storage
                if (local_guild) {
                  local_guilds[_.indexOf(local_guilds, local_guild)] = tempObj;
                } else {
                  local_guilds.push(tempObj);
                }

                localStorageService.set("guilds", local_guilds);

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
            name: $filter("fullUserName")(member.user),
            color: COLORS[index],
            endorsements: [],
            line_data: [],
            polar_data: [
              { type: 1, points: 0, max: 0, y: 0 },
              { type: 2, points: 0, max: 0, y: 0 },
              { type: 3, points: 0, max: 0, y: 0 },
              { type: 4, points: 0, max: 0, y: 0 },
            ],
            selected: member.user.id == vm.user.id ? true : false,
            showInLegend: member.user.id == vm.user.id ? true : false,
          };
        }),
        first_line_graph_load: true,
        horizontal_axis: [],
        endorsed_rules: [],
      };

      for (var index = 0; index <= guild.world.course_duration - 1; index++) {
        // Only show weeks that have been in the past
        if (!moment().isBefore(moment(guild.world.start).add(index, "weeks"), "day")) {
          var lineObject = { y: 0, total: 0, max: 0, points: 0 };
          data.graphs_data.line.push(lineObject);
          data.horizontal_axis.push("Week " + (index + 1));

          // Add basis statistics for the users per week
          _.each(data.members_data, function(member) {
            member.line_data.push(lineObject);
          });
        }

        if (
          moment().isBetween(
            moment(guild.world.start).add(index, "weeks"),
            moment(guild.world.start)
              .add(index, "weeks")
              .add(6, "days"),
            "day"
          )
        ) {
          guild.current_week = {
            start: moment(guild.world.start).add(index, "weeks"),
            end: moment(guild.world.start)
              .add(index, "weeks")
              .add(6, "days")
              .endOf("day"),
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
            y: (weekly_points_earned * 100) / weekly_max_points, // percentage,
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
          name: $translate.instant("AVERAGE"),
          visible: true,
          color: Highcharts.Color("#222222")
            .setOpacity(0.1)
            .get(),
          data: [{ y: 0 }, { y: 0 }, { y: 0 }, { y: 0 }],
        },
      ];

      // Prepare the line data
      data.graphs_data.line = [
        {
          name: $translate.instant("AVERAGE"),
          data: _.map(data.members_data[0].line_data, function(line_data) {
            return { y: 0, total: 0, max: 0, points: 0 };
          }),
          color: Highcharts.Color("#222222")
            .setOpacity(0.1)
            .get(),
          yAxis: 0,
        },
      ];

      _.each(data.members_data, function(member_data) {
        // POLAR CHART
        // Add the score in percentage per type
        _.each(member_data.polar_data, function(polar_data, endorsement_type) {
          if (polar_data.points) {
            polar_data.y = (polar_data.points * 100) / polar_data.max;
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
          // Add the score of the previous week
          if (week > 0) line_data.total += member_data.line_data[week - 1].total;

          // for the average chart
          data.graphs_data.line[0].data[week].y += line_data.y;
        });

        data.graphs_data.line.push({
          visible: member_data.selected,
          name: member_data.name,
          data: member_data.line_data,
          color: member_data.color,
          showInLegend: member_data.showInLegend,
        });
      });

      // Update the average score for the polar chart
      data.graphs_data.polar[0].data = _.map(data.graphs_data.polar[0].data, function(polar_data) {
        return { y: polar_data.y / data.members_data.length };
      });

      // update the average score for the line chart
      data.graphs_data.line[0].data = _.map(data.graphs_data.line[0].data, function(line_data) {
        return {
          y: line_data.y / data.members_data.length,
        };
      });

      createLineChart(data, guild);
      createPolarChart(data, guild);

      data.first_line_graph_load = false;
      vm.data = data;
      vm.guild = guild;
    }

    function createLineChart(data, guild) {
      $("#line__" + guild.id).highcharts({
        chart: { type: "spline", animation: data.first_line_graph_load },
        title: { text: "Feedback " + guild.name },
        // subtitle: { text}
        xAxis: { categories: data.horizontal_axis },
        yAxis: [
          {
            title: { text: "Punten percentage" },
            minorGridLineWidth: 0,
            gridLineWidth: 1,
            alternateGridColor: null,
            min: 0,
            max: 100,
          },
          //{ title: { text: 'Totaal aantal punten'}, minorGridLineWidth: 0, gridLineWidth: 1, alternateGridColor: null, opposite: true}
        ],
        tooltip: {
          shared: true,
          pointFormat: "{series.name} <strong>{point.y:,.0f}%</strong><br>",
        },
        plotOptions: {
          spline: { lineWidth: 4, marker: { enabled: true, symbol: "circle" } },
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
        exporting: { filename: guild.name + "_" + moment().format("DD/MM/YY HH:mm") },
        credits: { href: null, text: moment().format("DD/MM/YY HH:mm") },
      });
    }

    function createPolarChart(data, guild) {
      $("#polar__" + guild.id).highcharts({
        chart: { polar: true, type: "spline" },
        title: { text: "Feedback focus " + guild.name },
        xAxis: {
          categories: [
            $translate.instant("ATTITUDE"),
            $translate.instant("FUNCTIONING_IN_TEAM"),
            $translate.instant("KNOWLEDGE_DEVELOPMENT"),
            $translate.instant("ACCOUNTABILITY"),
          ],
          tickmarkPlacement: "on",
          lineWidth: 0,
        },
        yAxis: { gridLineInterpolation: "polygon", visible: false, min: 0, max: 100 },
        tooltip: {
          shared: true,
          pointFormat: "{series.name}: <strong>{point.y:,.0f}%</strong> <br>",
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
        exporting: { filename: guild.name + "_" + moment().format("DD/MM/YY HH:mm") },
        credits: { href: null, text: moment().format("DD/MM/YY HH:mm") },
      });
    }
  }
})();
