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
        World,
        TrelloApi,
        LECTURER_ACCESS_LEVEL,
        COLORS
    ) {

        if(Global.getAccess() < LECTURER_ACCESS_LEVEL) {
            Global.notAllowed();
            return;
        }

        Global.setRouteTitle('Group progress');
        Global.setRouteBackRoute('base.guilds.overview');

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
                    Notifications.simpleToast('Group ' + $stateParams.guildUuid + ' does not exist');
                    $state.go('base.guilds.overview');
                }

                self.guild = response;

                Global.setRouteTitle('Group progress', self.guild.name);

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
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function prepareGraphData(guild) {
            if(!guild.trello_board || !guild.trello_done_list) {
                return Notifications.simpleToast('Please make sure the group has an trello board and done list set.');
            }
            if(!guild.world.start || !guild.world.course_duration) {
                return Notifications('Please make sure the class start and the course duration are set.');
            }

            var weeks = [];

            for(var i = 0; i <= guild.world.course_duration; i+= 7) {
                weeks.push({
                    week: (i / 7) + 1,
                    start: moment(guild.world.start).add(i, 'days'),
                    end: moment(guild.world.start).add(i + 6, 'days'),
                    cards: []
                });
            }

            TrelloApi.Authenticate()
            .then(function() {

                var graph_data = {
                    total_cards: 0,
                    bar: {
                        categories: [],
                        series: []
                    },
                    pie: {
                        series: [{
                            name: 'cards',
                            data: []
                        }]
                    }
                };

                TrelloApi.Rest('GET', 'boards/' + guild.trello_board)
                .then(function(response) {
                    self.board.name = response.name;

                    TrelloApi.Rest('GET', 'boards/' + guild.trello_board + '/members')
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

                                // Adding the cards to the members of the group
                                if(card.idMembers.length >= 1) {
                                    _.each(card.idMembers, function(member_id) {
                                        graph_data.total_cards++;
                                        var member = _.findWhere(self.board.members, {id: member_id});
                                        member.cards.push(card);
                                        card.members.push(member);
                                    });
                                } else {
                                    _.each(self.board.members, function(member) {
                                        graph_data.total_cards++;
                                        member.cards.push(card);
                                        card.members.push(member);
                                    });
                                }

                                // Adding the cards to the weeks
                                _.each(weeks, function(week) {
                                    if(card.created_at.isBetween(week.start, week.end, 'day') ||
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
                                console.log(week);
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
                                    y: member.cards.length * 100 / graph_data.total_cards,
                                    cards: member.cards.length
                                });
                                member.labels = [];

                                _.each(member.cards, function(card) {
                                    if(card.done) {
                                        _.each(card.labels, function(label) {
                                            switch (label.color) {
                                                case 'green':
                                                    label.color = '#61BD4F';
                                                    break;
                                                case 'yellow':
                                                    label.color = '#F2D600';
                                                    break;
                                                case 'orange':
                                                    label.color = '#FFAB4A';
                                                    break;
                                                case 'red':
                                                    label.color = '#EB5A46';
                                                    break;
                                                case 'purple':
                                                    label.color = '#C377E0';
                                                    break;
                                                case 'blue':
                                                    label.color = '#0079BF';
                                                    break;
                                                case 'sky':
                                                    label.color = '#00C2E0';
                                                    break;
                                                case 'pink':
                                                    label.color = '#FF80CE';
                                                    break;
                                                case 'black':
                                                    label.color = '#4d4d4d';
                                                    break;
                                            }
                                            if(_.findWhere(member.labels, { color: label.color})) {
                                                _.findWhere(member.labels, { color: label.color}).amount_used++;
                                            } else {
                                                member.labels.push({
                                                    color: label.color,
                                                    amount_used: 1,
                                                    name: label.name
                                                });
                                            }
                                        });
                                    }
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

        function buildGraphs(graph_data) {
            $('#cards_per_week').highcharts({
                chart: { type: 'column' },
                title: { text: self.guild.name + ' amount of cards' },
                subtitle: { text: 'Per user per week' },
                xAxis: { categories: graph_data.bar.categories, crosshair: true },
                yAxis: { title: { text: 'Cards' } },
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
                exporting: { enabled: Global.getAccess() > 1 ? true : false },
                credits: { text: moment().format("DD/MM/YY HH:mm"), href: '' }
            });

            $('#cards_total').highcharts({
                chart: { type: 'pie' },
                exporting: { enabled: Global.getAccess() > 1 ? true : false },
                title: { text: self.guild.name +': total cards per user' },
                tooltip: { pointFormat: '{series.name}: <b>{point.cards}</b>' },
                plotOptions: {
                    pie: {
                        // Maybe for future use
                        // allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            format: '<b>{point.name}</b>: {point.y:.1f} %'
                        }
                    },
                },
                series: graph_data.pie.series,
                credits: { text: moment().format("DD/MM/YY HH:mm"), href: '' }
            });
        }


    }

}());
