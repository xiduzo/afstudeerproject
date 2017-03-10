(function () {
    'use strict';

    angular
        .module('cmd.guild')
        .controller('GuildWorkloadController', GuildWorkloadController);

    /** @ngInject */
    function GuildWorkloadController(
        $scope,
        $mdDialog,
        $mdToast,
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

        Global.setRouteTitle('Workload');
        Global.setRouteBackRoute(null);

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.createChart = createChart;
        self.buildGraphData = buildGraphData;
        self.showMemberWorkload = showMemberWorkload;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.selected_guild = Global.getSelectedGuild();
        self.guilds = [];
        self.loading_page = true;


        $scope.$on('guild-changed', function(event, guild) {
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
                self.loading_page = false;
                return false;
            }
            if(!guild.world.start || !guild.world.course_duration) {
                guild.no_world_settings = true;
                self.loading_page = false;
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
                                series: [
                                    {
                                        type: 'pie',
                                        name: 'Totaal aantal kaarten',
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

                        _.each(response, function(user, index) {
                            guild.board.members.push({
                                name: user.fullName,
                                color: COLORS[index],
                                id: user.id,
                                cards: [],
                                focus: []
                            });
                        });

                        TrelloApi.Rest('GET', 'boards/' + guild.trello_board + '/cards' )
                        .then(function(response) {
                            guild.insight_data = {
                                total_cards: 0,
                                cards_done: 0,
                                course_weeks: []
                            };
                            for(var index = 0; index <= guild.world.course_duration; index++) {
                                guild.insight_data.course_weeks.push({
                                    name: 'Week ' + (index+1),
                                    start: moment(guild.world.start).add(index, 'weeks'),
                                    end: moment(guild.world.start).add(index+1, 'weeks'),
                                    current_week: moment().isBetween(moment(guild.world.start).add(index, 'weeks'), moment(guild.world.start).add(index+1, 'weeks'), 'day'),
                                    cards: [],
                                    cards_due: []
                                });
                            }
                            _.each(response, function(card) {
                                guild.insight_data.total_cards++;
                                card.created_at = moment(new Date(1000*parseInt(card.id.substring(0,8),16)));
                                card.done = card.idList === guild.trello_done_list ? true : false;
                                card.members = [];

                                if(card.done) {
                                    guild.insight_data.cards_done++;
                                    _.each(guild.insight_data.course_weeks, function(course_week) {
                                        if(moment(card.dateLastActivity).isBetween(
                                            course_week.start,
                                            course_week.end,
                                            'day'
                                            ) ||
                                            moment(card.dateLastActivity).isSame(course_week.start, 'day') ||
                                            moment(card.dateLastActivity).isSame(course_week.end, 'day')
                                        ) {
                                            course_week.cards.push(card);
                                        }
                                    });
                                } else {
                                    _.each(guild.insight_data.course_weeks, function(course_week) {
                                        if(moment(card.due).isBetween(
                                            course_week.start,
                                            course_week.end,
                                            'day'
                                            ) ||
                                            moment(card.dateLastActivity).isSame(course_week.start, 'day') ||
                                            moment(card.dateLastActivity).isSame(course_week.end, 'day')
                                        ) {
                                            course_week.cards_due.push(card);
                                        }
                                    });
                                }

                                if(card.idMembers.length >= 1) {
                                    _.each(card.idMembers, function(member_id) {
                                        var member = _.findWhere(guild.board.members, {id: member_id});
                                        member.cards.push(card);
                                        card.members.push(member);
                                    });
                                } else {
                                    _.each(guild.board.members, function(member) {
                                        member.cards.push(card);
                                        card.members.push(member);
                                    });
                                }
                            });

                            guild.current_week = _.findWhere(guild.insight_data.course_weeks, { current_week: true});

                            if(guild.current_week.index !== 0) {
                                guild.previous_week = guild.insight_data.course_weeks[_.indexOf(guild.insight_data.course_weeks, guild.current_week) - 1];
                                guild.insight_data.workload_percentage = guild.current_week.cards.length * 100 / guild.previous_week.cards.length - 100;
                                guild.insight_data.workload_percentage_icon = guild.insight_data.workload_percentage < -4 ? 'trending_down_dark' : guild.insight_data.workload_percentage > 4 ? 'trending_up_dark' : 'trending_flat_dark';
                            } else {
                                guild.previous_week = null;
                            }

                            _.each(guild.board.members, function(member) {
                                member.completed_cards = _.filter(member.cards,function(card) { return card.done;}).length;
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

                                guild.board.pie.series[0].data.push({
                                    name: member.name,
                                    color: member.color,
                                    y: roundToTwo(member.cards.length * 100 / guild.insight_data.total_cards),
                                    cards: member.cards.length
                                });

                                guild.board.pie.series[1].data.push({
                                    name: 'Voltooide kaarten',
                                    color: Highcharts.Color(member.color).setOpacity(0.75).get(),
                                    y: roundToTwo(_.filter(member.cards,function(card) { return card.done;}).length * 100 / guild.insight_data.total_cards),
                                    cards: _.filter(member.cards,function(card) { return card.done;}).length
                                });

                                guild.board.pie.series[1].data.push({
                                    name: 'Onvoltooide kaarten',
                                    color: Highcharts.Color(member.color).setOpacity(0.25).get(),
                                    y: roundToTwo(_.filter(member.cards,function(card) { return !card.done;}).length * 100 / guild.insight_data.total_cards),
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
            $('#chart__'+guild.id).highcharts({
                chart: {
                    type: 'pie'
                },
                title: {
                    text: 'Workload ' + guild.name,
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.cards}</b>'
                },
                plotOptions: {
                    pie: {
                        shadow: false,
                        center: ['50%', '50%']
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

        function showMemberWorkload(member, others, guild) {
            $mdDialog.show({
                controller: 'memberWorkloadController',
                controllerAs: 'memberWorkloadCtrl',
                templateUrl: 'app/routes/student/guild/workload/dialogs/dialog.workload.html',
                targetEvent: event,
                clickOutsideToClose: true,
                locals: {
                    member: member,
                    others: _.filter(others, function(other) {
                        return member.id != other.id;
                    }),
                    guild: guild
                }
            })
            .then(function(response) {

            }, function() {
                // Err dialog
            });
        }


    }
}());
