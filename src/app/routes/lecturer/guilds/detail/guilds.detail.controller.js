(function () {
    'use strict';

    angular
        .module('cmd.guilds')
        .controller('GuildDetailController', GuildDetailController);

    /** @ngInject */
    function GuildDetailController(
        $stateParams,
        $state,
        Guild,
        Global,
        Notifications,
        World,
        LECTURER_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < LECTURER_ACCESS_LEVEL) {
            Global.notAllowed();
            return;
        }

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.patchQuestStatus = patchQuestStatus;
        self.prepareGraphData = prepareGraphData;
        self.buildGraphs = buildGraphs;
        self.total_completed_objectives = 0;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.guild = [];
        self.colors = [
            '#2196F3',
            '#4CAF50',
            '#f44336',
            '#795548',
            '#009688',
            '#FFC107',
            '#3F51B5',
            '#E91E63',
            '#03A9F4',
            '#FF9800',
            '#673AB7',
            '#FF5722',
            '#9C27B0',
            '#00BCD4',
            '#8BC34A',
            '#9E9E9E',
            '#607D8B',
        ];

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
        function patchQuestStatus(quest) {
            Guild.patchQuestStatus(quest)
            .then(function(response) {
                if(response.completed) {
                    Notifications.simpleToast('Asignment marked as completed');
                } else {
                    Notifications.simpleToast('Asignment marked as uncompleted');
                }
            }, function(error) {
                // Err patch quest completion status
            });
        }

        function roundToTwo(num) {
            return +(Math.round(num + "e+2")  + "e-2");
        }

        function prepareGraphData(guild) {
            var graph_data = {
                weeknumber: 1,
                column_dates: [],
                horizontal_axis: [],
                series: [],
                points: [],
            };

            // Only need the completed objectives
            guild.objectives = _.filter(guild.objectives, {completed: true});
            self.total_completed_objectives = guild.objectives.length;

            // Prepare the graph data points
            _.each(guild.members, function(member, index) {
                var tempObj = {
                    id: member.id,
                    color: self.colors[index],
                    name: member.first_name + ' ' + member.surname_prefix + ' ' + member.surname,
                    points: 0, // Pie chart
                    data: [], // Column graph
                };

                // Need to have two seperate arrays b/c
                // We are gonna build two different charts
                graph_data.points.push(tempObj);
                graph_data.series.push(tempObj);
            });

            // Building the horizontal axis of the graph (date)
            for(var i = 0; i <= guild.world.course_duration; i++) {
                var date = moment(guild.world.start).add(i, 'day');
                graph_data.column_dates.push({date: date.format()});

                if(i === 0 || i % 7 === 0) {
                    graph_data.horizontal_axis.push('<b>Week ' + graph_data.weeknumber + '</b>');
                    graph_data.weeknumber++;
                } else {
                    graph_data.horizontal_axis.push(date.format('DD/MM'));
                }
            }

            // Building the column grah
            _.each(graph_data.column_dates, function(date, index) {
                // Building the base
                _.each(graph_data.series, function(serie) {
                    serie.data.push(null);
                });

                _.each(guild.objectives, function(objective) {
                    if(moment(date.date).isSame(objective.completed_at, 'day')) {
                        if(objective.assignments.length < 1) {
                            _.each(graph_data.series, function(serie) {
                                serie.data[index] += roundToTwo(objective.points / guild.members.length);
                            });
                        } else {
                            _.each(objective.assignments, function(assigned) {
                                var serie = _.find(graph_data.series, {
                                    id: assigned.user.id
                                });
                                serie.data[index] += roundToTwo(objective.points / objective.assignments.length);
                            });
                        }
                    }
                });
            });

            // Building the pie chart
            _.each(guild.objectives, function(objective) {
                if(objective.assignments.length < 1) {
                    _.each(graph_data.points, function(user) {
                        user.points += objective.points;
                    });
                } else {
                    _.each(objective.assignments, function(assigned) {
                        // Adding the points to the user
                        _.each(graph_data.points, function(person) {
                            if(assigned.user.id == person.id) {
                                person.points += roundToTwo(objective.points / objective.assignments.length);
                            }
                        });
                    });
                }
            });

            // Fixing the Y of each team member on the pie chart
            _.each(graph_data.points, function(point) {
                point.y = point.points ?
                point.points :
                100 / self.guild.members.length;
            });

            self.buildGraphs(graph_data);
        }

        function buildGraphs(graph_data) {
            $('#completed__tasks').highcharts({
                chart: { type: 'column' },
                exporting: { enabled: Global.getAccess() > 1 ? true : false },
                title: { text: 'Completed tasks ' + self.guild.name },
                xAxis: { categories: graph_data.horizontal_axis },
                yAxis: { title: { text: 'Total points earned' }, },
                tooltip: {
                    headerFormat: '<b>{point.x}</b><br/>',
                    pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
                },
                plotOptions: {
                    column: {
                        groupPadding: 0,
                        pointPadding: 0,
                        stacking: 'normal',
                    }
                },
                series: graph_data.series,
                credits: { text: moment().format("DD/MM/YY HH:mm"), href: '' }
            });

            $('#completed__tasks__explained').highcharts({
                chart: { type: 'pie' },
                exporting: { enabled: Global.getAccess() > 1 ? true : false },
                title: { text: 'Completion per user' },
                tooltip: { pointFormat: '{series.name}: <b>{point.points}</b>' },
                plotOptions: {
                    pie: {
                        // Maybe for future use
                        // allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                        }
                    }
                },
                series: [ { name: 'Points', data: graph_data.points } ],
                credits: { text: moment().format("DD/MM/YY HH:mm"), href: '' }
            });
        }


    }

}());
