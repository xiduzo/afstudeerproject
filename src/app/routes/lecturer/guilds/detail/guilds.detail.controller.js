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

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.guild = [];
        self.colors = [
            '#2196F3',
            '#4CAF50',
            '#f44336',
            '#795548',
            '#E91E63',
            '#03A9F4',
            '#673AB7',
            '#00BCD4',
            '#8BC34A',
            '#9E9E9E',
            '#9C27B0',
            '#FF9800',
            '#009688',
            '#3F51B5',
            '#FF5722',
            '#607D8B',
            '#FFC107',
        ];

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getGuild($stateParams.guildUuid)
            .then(function(response) {
                if(!response) {
                    GLobal.simpleToast('Group ' + $stateParams.guildUuid + ' does not exist');
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
                // Err
            });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function patchQuestStatus(quest) {
            Guild.patchQuestStatus(quest)
            .then(function(response) {
                if(response.completed) {
                    Global.simpleToast('Asignment marked as completed');
                } else {
                    Global.simpleToast('Asignment marked as uncompleted');
                }
            }, function(error) {
                // Err patch quest completion status
            });
        }

        function prepareGraphData(guild) {
            var course_duration = guild.world.course_duration;
            var starting_date = guild.world.start;

            var pie_graph_data = [];
            var bar_graph_data = [];

            var weeknumber = 0;
            var total_points = 0;

            var column_dates = [];
            var user_groups = [];

            bar_graph_data.horizontal_axis = [];
            bar_graph_data.series = [];
            // Only need the completed objectives
            guild.objectives = _.filter(guild.objectives, {completed: true});

            // Prepare the points per person
            _.each(guild.members, function(member) {
                var tempObj = { id: member.id, points: 0 };
                if(member.surname_prefix) {
                    tempObj.name = member.first_name + ' ' + member.surname_prefix + ' ' + member.surname;
                } else {
                    tempObj.name = member.first_name + ' ' + member.surname;
                }
                user_groups.push(tempObj);
            });

            // Building the horizontal axis of the graph (date)
            for(var i = 0; i <= course_duration; i++) {
                if(i === 0 || i % 7 === 0) {
                    bar_graph_data.horizontal_axis.push('<b>Week ' + weeknumber + '</b>');
                    weeknumber++;
                } else {
                    bar_graph_data.horizontal_axis.push(moment(starting_date)
                        .add(i, 'days').format('DD/MM')
                    );
                }
                var tempObj = {
                    date: moment(starting_date)
                        .add(i, 'day').format(),
                };
                column_dates.push(tempObj);
            }

            // Fill in the bar graph series
            _.each(user_groups, function(person, index) {
                var tempObj = {
                    user_id: person.id,
                    name: person.name,
                    color: self.colors[index],
                    data: [],
                };
                bar_graph_data.series.push(tempObj);
            });

            _.map(column_dates, function(date, index) {
                // Building the base
                _.each(bar_graph_data.series, function(serie) {
                    serie.data.push(null);
                });

                _.each(guild.objectives, function(objective) {
                    if(moment(date.date).isSame(objective.completed_at, 'day')) {
                        _.each(objective.assignments, function(assigned) {
                            var serie = _.find(bar_graph_data.series, {
                                user_id: assigned.user.id
                            });
                            serie.data[index] += objective.points / objective.assignments.length;
                        });
                    }
                });

            });

            _.each(guild.objectives, function(objective) {
                total_points += objective.points;
                if(objective.assignments.length < 1) {
                    _.map(user_groups, function(user, key) {
                        return user.points += objective.points;
                    });
                } else {
                    _.each(objective.assignments, function(assigned) {
                        // Adding the points to the user
                        _.map(user_groups, function(person) {
                            if(assigned.user.id == person.id) {
                                person.points += objective.points / objective.assignments.length;
                            }
                            return person;
                        });
                    });
                }
            });

            _.map(user_groups, function(person, index) {
                var tempObj = {
                    name: person.name,
                    y: person.points * 100 / total_points,
                    points: person.points,
                    color: self.colors[index],
                };
                pie_graph_data.push(tempObj);
            });

            self.buildGraphs(bar_graph_data, pie_graph_data);
        }

        function buildGraphs(bar_data, pie_data) {
            $('#completed__tasks').highcharts({
                chart: {
                    type: 'column'
                },
                exporting: {
                    // Only show the exporting button when you have a higher access level than the student
                    enabled: Global.getAccess() > 1 ? true : false
                },
                title: {
                    text: 'Completed tasks ' + self.guild.name
                },
                xAxis: {
                    categories: bar_data.horizontal_axis
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Total points earned'
                    },
                },
                legend: {
                    align: 'right',
                    x: -30,
                    verticalAlign: 'top',
                    y: 25,
                    floating: true,
                    backgroundColor: 'white',
                    borderColor: '#CCC',
                    borderWidth: 1,
                    shadow: false
                },
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
                series: bar_data.series,
                credits: {
                    text: moment().format("DD/MM/YY HH:mm"),
                    href: ''
                }
            });

            $('#completed__tasks__explained').highcharts({
                chart: {
                    type: 'pie'
                },
                exporting: {
                    // Only show the exporting button when you have a higher access level than the student
                    enabled: Global.getAccess() > 1 ? true : false
                },
                title: {
                    text: 'Completion per user'
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.points}</b>'
                },
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
                series: [
                    {
                        name: 'Points',
                        data: pie_data
                    }
                ],
                credits: {
                    text: moment().format("DD/MM/YY HH:mm"),
                    href: ''
                }
            });
        }


    }

}());
