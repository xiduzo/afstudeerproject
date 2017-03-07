(function () {
    'use strict';

    angular
        .module('cmd.guild')
        .controller('GuildProgressController', GuildProgressController);

    /** @ngInject */
    function GuildProgressController(
        $scope,
        $mdDialog,
        $mdToast,
        $rootScope,
        hotkeys,
        Guild,
        Global,
        localStorageService,
        Notifications,
        World,
        TrelloApi,
        STUDENT_ACCESS_LEVEL,
        COLORS
    ) {

        if(Global.getAccess() < STUDENT_ACCESS_LEVEL) {
            return Global.notAllowed();
        }

        Global.setRouteTitle('Progress');
        Global.setRouteBackRoute(null);

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.createChart = createChart;
        self.buildGraphData = buildGraphData;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.selected_guild = Global.getSelectedGuild();
        self.guilds = [];
        self.loading_page = true;


        $rootScope.$on('guild-changed', function(event, guild) {
            self.selected_guild = guild;

            if(_.findWhere(self.guilds, { id: self.selected_guild })) {
                guild = _.findWhere(self.guilds, { id: self.selected_guild});

                self.buildGraphData(guild);
            }

        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getUserGuilds(self.user.id)
        .then(function(response) {
            _.each(response.guilds, function(guildObject) {
                self.loading_page = true;
                var guild = guildObject.guild;

                World.getWorld(guild.world.id)
                .then(function(response) {
                    guild.world = response;
                    self.buildGraphData(guild);
                });
            });

        }, function() {
            // Err get user guilds
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
        function buildGraphData(guild) {
            guild.no_trello_settings = false;
            guild.no_world_settings = false;

            self.guilds.push(guild);

            if(!guild.trello_board || !guild.trello_done_list) {
                guild.no_trello_settings = true;
                return false;
            }
            if(!guild.world.start || !guild.world.course_duration) {
                guild.no_world_settings = true;
                return false;
            }

            TrelloApi.Authenticate()
            .then(function() {

                TrelloApi.Rest('GET', 'boards/' + guild.trello_board)
                .then(function(response) {

                    TrelloApi.Rest('GET', 'boards/' + guild.trello_board + '/members')
                    .then(function(response) {

                        guild.board = {
                            name: null,
                            members: [],
                            cards: [],
                            total_assigned_cards: 0,
                            pie: {
                                series: [{
                                    type: 'pie',
                                    name: 'Open cards',
                                    innerSize: '75%',
                                    data: [],
                                }]
                            }
                        };

                        _.each(response, function(user, index) {
                            guild.board.members.push({
                                name: user.fullName,
                                color: COLORS[index],
                                id: user.id,
                                cards: []
                            });
                        });

                        TrelloApi.Rest('GET', 'boards/' + guild.trello_board + '/cards' )
                        .then(function(response) {
                            guild.insight_data = {
                                cards_done: 0,
                                cards_in_progress: 0,
                            };
                            _.each(response, function(card) {
                                card.created_at = moment(new Date(1000*parseInt(card.id.substring(0,8),16)));
                                card.done = card.idList === guild.trello_done_list ? true : false;
                                card.members = [];

                                if (card.idList === guild.trello_done_list) {
                                    guild.insight_data.cards_done++;
                                } else {
                                    guild.insight_data.cards_in_progress++;
                                }

                                if(card.idMembers.length >= 1) {
                                    _.each(card.idMembers, function(member_id) {
                                        guild.board.total_assigned_cards++;
                                        var member = _.findWhere(guild.board.members, {id: member_id});
                                        member.cards.push(card);
                                        card.members.push(member);
                                    });
                                } else {
                                    _.each(guild.board.members, function(member) {
                                        guild.board.total_assigned_cards++;
                                        member.cards.push(card);
                                        card.members.push(member);
                                    });
                                }
                            });

                            _.each(guild.board.members, function(member) {
                                member.completed_cards = _.filter(member.cards,function(card) { return card.done;}).length;
                                guild.board.pie.series[0].data.push({
                                    name: member.name,
                                    color: member.color,
                                    y: roundToTwo((member.cards.length - member.completed_cards) * 100 / guild.insight_data.cards_in_progress),
                                    cards: _.filter(member.cards,function(card) { return !card.done;}).length
                                });
                            });
                            self.loading_page = false;

                            setTimeout(function () {
                                self.createChart(guild);
                            }, 100);
                        });
                    });
                });
            });

        }

        function createChart(guild) {
            $('#cards_to_do_'+guild.id).highcharts({
                chart: {
                    plotShadow: false
                },
                title: {
                    text: 'Open cards ' + guild.name,
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.cards}</b>'
                },
                plotOptions: {
                    pie: {
                        dataLabels: {
                            format: '<b>{point.name}</b>',
                        },
                        startAngle: -90,
                        endAngle: 90,
                        center: ['50%', '75%']
                    }
                },
                series: guild.board.pie.series,
                exporting: { enabled: Global.getAccess() > 1 ? true : false, },
                credits: {
                    text: moment().format("DD/MM/YY HH:MM"),
                    href: ''
                }
            });
        }



    }
}());
