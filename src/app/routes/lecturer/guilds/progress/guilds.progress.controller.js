(function () {
    'use strict';

    angular
        .module('cmd.guilds')
        .controller('GuildDetailProgressController', GuildDetailProgressController);

    /** @ngInject */
    function GuildDetailProgressController(
        $filter,
        $stateParams,
        $state,
        Guild,
        Global,
        Notifications,
        toastr,
        World,
        TrelloApi,
        LECTURER_ACCESS_LEVEL,
        COLORS
    ) {

        if(Global.getAccess() < LECTURER_ACCESS_LEVEL) {
            return Global.notAllowed();
        }

        Global.setRouteTitle('Team progressie');
        Global.setRouteBackRoute('base.home.dashboards.lecturer');

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.prepareGraphData = prepareGraphData;
        self.buildGraphs = buildGraphs;
        self.total_completed_objectives = 0;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.guild = [];
        self.members_data = [];
        self.loading_page = true;
        self.board = {
            name: null,
            members: [],
            cards: []
        };

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getGuild($stateParams.guildUuid)
            .then(function(response) {
                if(!response) {
                    toastr.error('Team ' + $stateParams.guildUuid + ' bestaad niet');
                    $state.go('base.guilds.overview');
                }
                Global.setRouteTitle('Team progressie ' + response.name);
                self.guild = response;

                World.getWorld(response.world.id)
                .then(function(response) {
                    self.guild.world = response;
                    self.prepareGraphData(self.guild);
                }, function(error) {
                    // Err get world
                });

            }, function() {
                // Err get guild
            });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function roundToTwo(num) {
            return parseFloat(num.toFixed(2));
        }

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function prepareGraphData(guild) {
            if(!guild.trello_board || !guild.trello_done_list) {
              guild.no_trello_settings = true;
              return toastr.warning('Zorg eerst dat trello goed gekoppelt is voor dit team');
            }
            if(!guild.world.start || !guild.world.course_duration) {
              guild.no_world_settings = true;
              return toastr.warning('Zorg ervoor dat de klas van dit team een startdatum en duur heeft ingesteld');
            }

            var weeks = [];

            for(var index = 0; index <= guild.world.course_duration; index++) {
                weeks.push({
                    week: index + 1,
                    start: moment(guild.world.start).add(index, 'weeks'),
                    end: moment(guild.world.start).add(index, 'weeks').add(6, 'days'),
                    cards: []
                });
            }

            if(!guild.no_trello_settings) {
              TrelloApi.Authenticate()
              .then(function() {

                var graph_data = {
                  total_cards: 0,
                  bar: {
                    categories: [],
                    series: []
                  },
                  pie: {
                    series: [
                      {
                        type: 'pie',
                        name: 'Totaal',
                        size: '93%',
                        data: [],
                        dataLabels: {
                          formatter: function () {
                            return this.y > 10 ? this.point.name : null;
                          },
                          color: '#ffffff',
                          distance: -50
                        }
                      },
                      {
                        type: 'pie',
                        name: 'Aantal',
                        data: [],
                        size: '100%',
                        innerSize: '95%',
                        dataLabels: {
                          formatter: function () {
                            return null;
                          }
                        }
                      }
                    ]
                  }
                };

                TrelloApi.Rest('GET', 'boards/' + guild.trello_board)
                .then(function(response) {
                  self.board.name = response.name;

                  TrelloApi.Rest('GET', 'boards/' + guild.trello_board + '/members/normal')
                  .then(function(response) {
                    _.each(response, function(user, index) {
                      self.board.members.push({
                        name: user.fullName,
                        color: COLORS[index],
                        id: user.id,
                        cards: []
                      });
                    });

                    TrelloApi.Rest('GET', 'boards/' + guild.trello_board + '/cards' )
                    .then(function(response) {
                      _.each(response, function(card) {
                        // Some extra info
                        card.created_at = moment(new Date(1000*parseInt(card.id.substring(0,8),16)));
                        card.done = card.idList === guild.trello_done_list ? true : false;
                        card.members = [];

                        // Adding the cards to the members of the team
                        if(card.idMembers.length >= 1) {
                          _.each(card.idMembers, function(member_id) {
                            graph_data.total_cards++;
                            var member = _.findWhere(self.board.members, {id: member_id});
                            if(!member) { return false; }
                            member.cards.push(card);
                            card.members.push(member);
                          });
                        }
                        // else {
                        //   _.each(self.board.members, function(member) {
                        //     graph_data.total_cards++;
                        //     member.cards.push(card);
                        //     card.members.push(member);
                        //   });
                        // }

                        // Adding the cards to the weeks
                        _.each(weeks, function(week) {
                          if(moment(card.created_at).isBetween(week.start, week.end, 'day') ||
                          card.created_at.isSame(week.start, 'day') ||
                          card.created_at.isSame(week.end, 'day')) {
                            week.cards.push(card);
                          }
                        });

                        self.board.cards.push(card);
                      });

                      _.each(self.board.members, function(member) {
                        member.completed_cards = 0;
                        _.each(member.cards, function(card) {
                          if(card.done) {
                            member.completed_cards++;
                          }
                        });
                      });

                      _.each(self.board.members, function(member) {
                        graph_data.bar.series.push({
                          id: member.id,
                          color: member.color,
                          name: member.name,
                          data: []
                        });
                      });

                      // Building the bar chart
                      _.each(weeks, function(week, index) {
                        _.each(graph_data.bar.series, function(serie) {
                          serie.data.push(0);
                        });

                        graph_data.bar.categories.push('Week ' + week.week);

                        _.each(week.cards, function(card) {
                          _.each(card.members, function(member) {
                            _.findWhere(graph_data.bar.series, { id: member.id }).data[index]++;
                          });
                        });
                      });

                      // Building the pie chart
                      _.each(self.board.members, function(member) {
                        graph_data.pie.series[0].data.push({
                          name: member.name,
                          color: member.color,
                          y: roundToTwo(member.cards.length * 100 / graph_data.total_cards),
                          cards: member.cards.length
                        });

                        graph_data.pie.series[1].data.push({
                          name: 'Voltooide kaarten',
                          color: Highcharts.Color(member.color).setOpacity(0.75).get(),
                          y: roundToTwo(_.filter(member.cards,function(card) { return card.done;}).length * 100 / graph_data.total_cards),
                          cards: _.filter(member.cards,function(card) { return card.done;}).length
                        });

                        graph_data.pie.series[1].data.push({
                          name: 'Onvoltooide kaarten',
                          color: Highcharts.Color(member.color).setOpacity(0.25).get(),
                          y: roundToTwo(_.filter(member.cards,function(card) { return !card.done;}).length * 100 / graph_data.total_cards),
                          cards: _.filter(member.cards,function(card) { return !card.done;}).length
                        });

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
                            name: focus[0].name
                          };
                        });
                      });

                      self.loading_page = false;

                      setTimeout(function () {
                        self.buildGraphs(graph_data);
                      }, 100);
                    });
                  });
                });
              }, function(error){
                console.log(error);
              });
            }
        }

        function buildGraphs(graph_data) {
            $('#cards_per_week').highcharts({
                chart: { type: 'column' },
                title: { text: self.guild.name + ' aantal kaarten' },
                subtitle: { text: 'Per lid per week' },
                xAxis: { categories: graph_data.bar.categories, crosshair: true },
                yAxis: { title: { text: 'Aantal' } },
                tooltip: {
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                    '<td style="padding:0"><b>{point.y} cards</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                plotOptions: {
                    column: { pointPadding: 0, borderWidth: 0 },
                    series: {
                        events: {
                            legendItemClick: function () { return false; }
                        }
                    },
                },
                series: graph_data.bar.series,
                exporting: {
                  filename: "Aantal kaarten per lid per week_" + self.guild.name + "_" + moment().format()
                },
                credits: { text: moment().format("DD/MM/YY HH:mm"), href: '' }
            });

            $('#cards_total').highcharts({
                chart: { type: 'pie' },
                exporting: {
                  filename: "Aantal kaarten per lid totaal_" + self.guild.name + "_" + moment().format()
                },
                title: { text: self.guild.name +': aantal kaarten' },
                subtitle: { text: 'Per lid totaal' },
                tooltip: { pointFormat: '{series.name}: <b>{point.cards}</b>' },
                plotOptions: {
                    pie: {
                        shadow: false,
                        center: ['50%', '50%']
                    }
                },
                series: graph_data.pie.series,
                credits: { text: moment().format("DD/MM/YY HH:mm"), href: '' }
            });
        }


    }

}());
