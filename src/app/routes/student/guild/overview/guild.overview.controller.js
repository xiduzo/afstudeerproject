(function () {
    'use strict';

    angular
        .module('cmd.guild')
        .controller('GuildOverviewController', GuildOverviewController);

    /** @ngInject */
    function GuildOverviewController(
        $mdDialog,
        $mdToast,
        Guild,
        Global,
        Quest,
        World,
        STUDENT_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < STUDENT_ACCESS_LEVEL) {
            Global.notAllowed();
            return;
        }

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.createExperienceChart = createExperienceChart;
        self.addObjective = addObjective;
        self.removeObjective = removeObjective;
        self.buildGraphData = buildGraphData;
        self.updateStatus = updateStatus;
        self.guildHistoryUpdate = guildHistoryUpdate;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.guilds = [];

        var quest_points = [];
        var categories = [];
        var weeknumber = 0;
        var objectives_graph_line = [];
        var horizontal_axis = [];

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getUserGuilds(self.user.id)
        .then(function(response) {
            _.each(response.guilds, function(guildObject) {
                var guild = guildObject.guild;

                World.getWorld(guild.world)
                .then(function(response) {
                    var worldQuests = response.quests;

                    // Quick fix bc I changed the serializer
                    _.each(guild.quests, function(quest) {
                        quest.quest = quest.quest.url;
                    });
                    // Filter out all the quest we allready have
                    // For this guild
                    worldQuests = _.filter(worldQuests, function(quest) {
                        if(!_.findWhere(guild.quests, {quest: quest.url})) {
                            return quest;
                        }
                    });

                    // Add all the new quests
                    _.each(worldQuests, function(quest) {
                        Guild.addQuest(guild.url, quest.url)
                        .then(function(response) {
                            guild.quests.push(response);
                        }, function(error) {
                            // Err add quest
                        });
                    });

                    guild.world_start_date = moment(response.start).format();
                    guild.course_duration = response.course_duration;

                    self.guilds.push(guild);
                    self.buildGraphData(guild);

                });
            });
        }, function() {
            // Err get user guilds
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function buildGraphData(guild) {
            var objectives = guild.objectives;
            var objective_groups = [];
            var previous_day_data = [];
            var objectives_graph_items = [];
            var starting_date = guild.world_start_date;
            var course_duration = guild.course_duration;
            var weeknumber = 1;
            var previous_points = null;
            objectives_graph_line = [];

            // Building the horizontal axis of the graph (date)
            for(var i = 0; i <= course_duration; i++) {
                if(i === 0 || i % 7 === 0) {
                    horizontal_axis.push('<b>Week ' + weeknumber + '</b>');
                    weeknumber++;
                } else {
                    horizontal_axis.push(moment(starting_date)
                        .add(i, 'days')
                        .format('DD/MM')
                    );
                }
                var tempObj = {
                    created_at: moment(starting_date)
                        .add(i, 'day')
                        .format()
                };
                objective_groups.push(tempObj);
            }

            // Grouping the arrays
            objectives = _.groupBy(objectives, function(objective) {
                return moment(objective.created_at).format('DD/MM/YY');
            });
            objective_groups = _.groupBy(objective_groups, function(objective) {
                return moment(objective.created_at).format('DD/MM/YY');
            });

            // Overwrite the objective_groups
            _.each(objectives, function(objective) {
                var date = moment(objective[0].created_at).format('DD/MM/YY');
                _.each(objective,function(group) {
                    var objective_group = objective_groups[date];
                    if(objective_group[0].points) {
                        objective_group.push(group);
                    } else {
                        objective_group = [group];
                    }
                    objective_groups[date] = objective_group;
                });
            });

            // Combine the day with all the previous days
            _.each(objective_groups, function(objective, index) {
                if(previous_day_data.length) {
                    objective = _.union(previous_day_data, objective);
                }
                previous_day_data = objective;
                // Overwrite the objectives
                objective_groups[index] = objective;
            });

            // Reduce the groups to single objects for the chart
            _.each(objective_groups, function(group) {
                var reduced = _.reduce(group, function(memo, objective) {
                    if(objective.id) {
                        memo.date = _.last(group).created_at;
                        // Only add the points if the objective isnt completed yet OR
                        // if the completion date is after the group date
                        if(objective.completed &&
                            moment(objective.completed_at)
                            .isSameOrBefore(memo.date, 'day')
                        ) {
                            memo.points += 0;
                        } else {
                            memo.points += objective.points;
                        }
                    }
                    return memo;
                }, { date: null, points: 0 });
                reduced.date = reduced.date ? moment(reduced.date).format('DD/MM') : null;
                // Add the item to the graph items
                objectives_graph_items.push(reduced);
            });

            for(i = 0; i <= course_duration; i++) {
                var date = moment(starting_date).add(i, 'day');
                var match = _.findWhere(
                    objectives_graph_items,
                    {date: date.format('DD/MM')}
                );

                if(moment().add(5, 'hours').isBefore(date)) {
                    objectives_graph_line.push(null);
                } else if(match) {
                    previous_points = match.points;
                    objectives_graph_line.push(match.points);
                } else {
                    objectives_graph_line.push(previous_points);
                }
            }


            setTimeout(function () {
                self.createExperienceChart(guild);
            }, 100);
        }

        function addObjective(guild) {
            $mdDialog.show({
                controller: 'addObjectiveController',
                controllerAs: 'addObjectiveCtrl',
                templateUrl: 'app/routes/coordinator/worlds/quests/new/objectives/objectives.html',
                targetEvent: event,
                clickOutsideToClose: true,
                locals: {
                    title: 'Add objective for ' + guild.name,
                    about: 'quest objective',
                }
            })
            .then(function(response) {
                if(!response ||
                    !response.name ||
                    !response.objective ||
                    !response.points) {
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Fill in all the fields to add an objective')
                        .position('bottom right')
                        .hideDelay(3000)
                    );
                    return;
                }

                Guild.addObjective(guild.url, response)
                .then(function(response) {
                    guild.objectives.unshift(response);
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Objective ' + response.name + ' is added')
                        .position('bottom right')
                        .hideDelay(3000)
                    );
                    var update = '\'' +response.name + '\' has been added';
                    self.guildHistoryUpdate(guild, update);
                }, function(error) {
                    // Err add objective
                });
            }, function() {
                // Err dialog
            });
        }

        function removeObjective(guild, objective) {
            Guild.removeObjective(objective.id)
            .then(function(response) {
                guild.objectives.splice(guild.objectives.indexOf(objective), 1);
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Objective ' + objective.name + ' removed')
                    .position('bottom right')
                    .hideDelay(3000)
                );
                self.buildGraphData(guild);
                var update = '\'' + objective.name + '\' has been removed';
                self.guildHistoryUpdate(guild, update);
            }, function(error) {
                // Err remove objective
            });
        }

        function updateStatus(guild, objective) {
            objective.completed_at = !objective.completed ?
                moment().utc().format() : null;
            Guild.patchObjective(objective)
            .then(function(response) {
                var update;
                update = response.completed ? 'done' : 'undone';
                update = '\''+response.name+'\' has been marked as '+update;
                self.guildHistoryUpdate(guild, update);
            }, function(error) {
                // Err patch objective
            });
        }

        function guildHistoryUpdate(guild, update) {
            Guild.addHistoryUpdate(Global.getUser().url, guild.url, update)
            .then(function(response) {
                guild.history_updates.push(response);
                self.buildGraphData(guild);
            }, function(error) {
                // Err adding history update
            });
        }

        function createExperienceChart(guild) {
            $('#'+guild.id).highcharts({
                chart: { backgroundColor: 'rgba(0,0,0,0)' },
                title: { text: 'Progress of ' + guild.name },
                xAxis: {
                    title: { text: 'Dagen' },
                    categories: horizontal_axis
                },
                yAxis: {
                    title: { text: 'Remaning objective points' },
                    min: 0
                },
                // Only show the exporting button when you have
                // a higher access level than the student
                exporting: { enabled: false, },
                legend: { enabled: false },
                tooltip: {
                    shared: false,
                    pointFormat: '{series.name}: <strong>{point.y:,.0f}</strong>'
                },
                plotOptions: {
                    series: {
                        animation: false
                    }
                },
                series: [
                    {
                        name: 'Remaining objective points',
                        data: objectives_graph_line,
                        color: '#616161'
                    }
                ],
                credits: {
                    text: moment().format("DD/MM/YY HH:MM"),
                    href: ''
                }
            });
        }

    }

}());
