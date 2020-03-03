(function() {
  "use strict";

  angular.module("cmd.guild").controller("GuildWorkloadController", GuildWorkloadController);

  /** @ngInject */
  function GuildWorkloadController(
    $filter,
    $scope,
    $mdDialog,
    $timeout,
    $mdToast,
    hotkeys,
    Guild,
    Global,
    localStorageService,
    Notifications,
    World,
    TrelloApi,
    toastr,
    STUDENT_ACCESS_LEVEL,
    COLORS
  ) {
    if (Global.getAccess() < STUDENT_ACCESS_LEVEL) {
      return Global.notAllowed();
    }

    Global.setRouteTitle("Werkverdeling");
    Global.setRouteBackRoute(null);

    var vm = this;

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Methods
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    vm.showMemberWorkload = showMemberWorkload;

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Variables
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    vm.user = Global.getUser();
    vm.user.trello = localStorageService.get("trello_user") ? true : false;
    vm.selected_guild = Global.getSelectedGuild();
    vm.guilds = [];

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Services
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Extra logic
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    $scope.$on("guild-changed", function(event, guild) {
      vm.selected_guild = guild;

      if (guild !== undefined) {
        if (!_.findWhere(vm.guilds, { id: guild })) {
          getGuildData(guild);
        } else {
          buildGraphData(_.findWhere(vm.guilds, { id: guild }));
        }
      }
    });

    if (vm.selected_guild !== undefined && vm.selected_guild !== null) {
      getGuildData(vm.selected_guild);
    }

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Method Declarations
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    function roundToTwo(num) {
      return parseFloat(num.toFixed(2));
    }

    function getTrelloCards(guild) {
      if (!vm.user.trello) return;
      TrelloApi.Authenticate()
        .then(function() {
          TrelloApi.Rest("GET", "boards/" + guild.trello_board + "/cards")
            .then(function(response) {
              var cards = response;

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

          guild.world.end = moment(guild.world.start).add(guild.world.course_duration, "weeks").add(6, "days");
          if (
            moment().isAfter(moment(guild.world.start).add(guild.world.course_duration, "weeks").add(6, "days"), "day")
          ) {
            guild.ended = true;
          }

          // Check for trello
          if (!guild.trello_done_list || !guild.trello_board) {
            guild.trello_not_configured = true;
          } else {
            getTrelloCards(guild);
          }

          vm.guilds.push(guild);

          // Get endorsements from the localstorage
          if (
            _.findWhere(local_guilds, { guild: guild.id }) &&
            moment(_.findWhere(local_guilds, { guild: guild.id }).datetime).isAfter(moment().subtract(1, "hours"))
          ) {
            guild.rules = _.findWhere(local_guilds, { guild: guild.id }).rules;
            buildGraphData(guild);
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

    var maxTries = 20;

    function processTrelloCards(guild) {
      if (guild.trello_cards == undefined && maxTries > 0) {
        maxTries--;
        return $timeout(function() {
          processTrelloCards(guild);
        }, 1000);
      }

      _.each(guild.trello_cards, function(card) {
        guild.insight_data.total_cards++;
        card.created_at = moment(new Date(1000 * parseInt(card.id.substring(0, 8), 16)));
        card.done = card.idList === guild.trello_done_list ? true : false;
        card.members = [];

        _.each(guild.insight_data.course_weeks, function(course_week) {
          if (
            (moment(card.dateLastActivity).isBetween(course_week.start, course_week.end, "day") ||
              moment(card.dateLastActivity).isSame(course_week.start, "day") ||
              moment(card.dateLastActivity).isSame(course_week.end, "day")) &&
            card.done
          ) {
            // TODO
            // Make the cards done working again
            guild.insight_data.cards_done++;
            course_week.cards.push(card);
          }

          if (card.due) {
            if (
              (moment(card.due).isBetween(course_week.start, course_week.end, "day") ||
                moment(card.due).isSame(course_week.start, "day") ||
                moment(card.due).isSame(course_week.end, "day")) &&
              !card.done
            ) {
              course_week.cards_due.push(card);
            }
          }
        });

        if (card.idMembers.length >= 1) {
          _.each(card.idMembers, function(member_id) {
            var member = _.findWhere(guild.board.members, { id: member_id });
            if (!member) {
              return false;
            }
            member.cards.push(card);
            card.members.push(member);
          });
        }
      });

      guild.current_week = _.findWhere(guild.insight_data.course_weeks, { current_week: true });
      if (_.indexOf(guild.insight_data.course_weeks, guild.current_week) > 0) {
        guild.previous_week =
          guild.insight_data.course_weeks[_.indexOf(guild.insight_data.course_weeks, guild.current_week) - 1];
        guild.insight_data.workload_percentage =
          guild.current_week.cards.length * 100 / guild.previous_week.cards.length - 100;
        if (isNaN(guild.insight_data.workload_percentage)) {
          guild.insight_data.workload_percentage = 0;
        }
        guild.insight_data.workload_percentage_icon =
          guild.insight_data.workload_percentage < -4
            ? "trending_down_dark"
            : guild.insight_data.workload_percentage > 4 ? "trending_up_dark" : "trending_flat_dark";
      } else {
        guild.previous_week = null;
      }

      _.each(guild.board.members, function(member) {
        member.completed_cards = _.filter(member.cards, function(card) {
          return card.done;
        }).length;
        member.focus = [];

        _.each(member.cards, function(card) {
          _.each(card.labels, function(label) {
            member.focus.push(label);
          });
        });

        member.total_focus = 0;
        member.focus = _.groupBy(member.focus, function(focus) {
          return focus.color;
        });

        member.focus = _.map(member.focus, function(focus) {
          member.total_focus += focus.length;
          return {
            times: focus.length,
            color: focus[0].color,
            name: focus[0].name,
          };
        });

        guild.board.pie.series[0].data.push({
          name: member.name,
          color: member.color,
          y: roundToTwo(member.cards.length * 100 / guild.insight_data.total_cards),
          cards: member.cards.length,
        });

        guild.board.pie.series[1].data.push({
          name: "Voltooide kaarten",
          color: Highcharts.Color(member.color).setOpacity(0.75).get(),
          y: roundToTwo(
            _.filter(member.cards, function(card) {
              return card.done;
            }).length *
              100 /
              guild.insight_data.total_cards
          ),
          cards: _.filter(member.cards, function(card) {
            return card.done;
          }).length,
        });

        guild.board.pie.series[1].data.push({
          name: "Onvoltooide kaarten",
          color: Highcharts.Color(member.color).setOpacity(0.25).get(),
          y: roundToTwo(
            _.filter(member.cards, function(card) {
              return !card.done;
            }).length *
              100 /
              guild.insight_data.total_cards
          ),
          cards: _.filter(member.cards, function(card) {
            return !card.done;
          }).length,
        });
      });

      $timeout(function() {
        createChart(guild);
      }, 150);
    }

    function getTrelloMembers(guild) {
      TrelloApi.Rest("GET", "boards/" + guild.trello_board + "/members/normal").then(function(response) {
        _.each(response, function(member, index) {
          guild.board.members.push({
            name: member.fullName,
            color: COLORS[index],
            id: member.id,
            cards: [],
            focus: [],
          });
        });
      });
    }

    function buildGraphData(guild) {
      getTrelloMembers(guild);

      guild.board = {
        name: null,
        members: [],
        cards: [],
        total_assigned_cards: 0,
        pie: {
          series: [
            {
              type: "pie",
              name: "Totaal",
              size: "93%",
              data: [],
              dataLabels: {
                formatter: function() {
                  return this.y > 10 ? this.point.name : null;
                },
                color: "#ffffff",
                distance: -50,
              },
            },
            {
              type: "pie",
              name: "Aantal",
              data: [],
              size: "100%",
              innerSize: "95%",
              dataLabels: {
                formatter: function() {
                  return null;
                },
              },
            },
          ],
        },
      };
      guild.insight_data = {
        total_cards: 0,
        cards_done: 0,
        course_weeks: [],
      };

      for (var index = 0; index <= guild.world.course_duration; index++) {
        guild.insight_data.course_weeks.push({
          name: "Week " + (index + 1),
          start: moment(guild.world.start).add(index, "weeks"),
          end: moment(guild.world.start).add(index, "weeks").add(6, "days"),
          current_week:
            moment().isBetween(
              moment(guild.world.start).add(index, "weeks"),
              moment(guild.world.start).add(index, "weeks").add(6, "days"),
              "day"
            ) ||
            moment().isSame(moment(guild.world.start).add(index, "weeks"), "day") ||
            moment().isSame(moment(guild.world.start).add(index, "weeks").add(6, "days"), "day"),
          cards: [],
          cards_due: [],
        });
      }

      // Cards are loaded in a-synnc so we have to cheat a little bit over here
      processTrelloCards(guild);
    }

    function createChart(guild) {
      $("#chart__" + guild.id).highcharts({
        chart: { type: "pie" },
        title: { text: "Werkverdeling " + guild.name },
        tooltip: { pointFormat: "{series.name}: <b>{point.cards}</b>" },
        plotOptions: {
          pie: { shadow: false, center: [ "50%", "50%" ] },
        },
        series: guild.board.pie.series,
        exporting: { enabled: Global.getAccess() > 1 ? true : false },
        credits: {
          text: moment().format("DD/MM/YY HH:MM"),
          href: "",
        },
      });
    }

    function showMemberWorkload(member, others, guild) {
      $mdDialog
        .show({
          controller: "memberWorkloadController",
          controllerAs: "memberWorkloadCtrl",
          templateUrl: "app/routes/student/guild/workload/dialogs/dialog.workload.html",
          targetEvent: event,
          clickOutsideToClose: true,
          locals: {
            member: member,
            others: _.filter(others, function(other) {
              return member.id != other.id;
            }),
            guild: guild,
          },
        })
        .then(
          function(response) {},
          function() {
            // Err dialog
          }
        );
    }
  }
})();
