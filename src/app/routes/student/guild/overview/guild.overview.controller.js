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

                    Guild.getQuests(guild.id)
                    .then(function(response) {
                        guild.quests = response;

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

                    }, function(error) {
                        // Err get quests
                    });

                    self.guilds.push(guild);
                    self.buildGraphData(response, guild);

                });
            });
        }, function() {
            // Err get user guilds
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function buildGraphData(world, guild) {
            var objectives = guild.objectives;
            var previous_day_data = [];
            var objectives_graph_items = [];
            var starting_date = moment(world.start).format();
            var course_duration = world.course_duration;
            var weeknumber = 1;
            var previous_points = null;
            guild.objective_points = 0;
            guild.completed_objective_points = 0;


            // Building the horizontal axis of the graph (date)
            for(var i = 0; i <= course_duration; i++) {
                if(i === 0 || i % 7 === 0) {
                    horizontal_axis.push('<b>Week ' + weeknumber + '</b>');
                    weeknumber++;
                } else {
                    horizontal_axis.push(moment(starting_date)
                        .add(i, 'day')
                        .format('DD/MM')
                    );
                }
                var tempObj = {
                    date: moment(starting_date)
                        .add(i, 'day')
                        .format('DD/MM'),
                    points: null
                };
            }

            var test_data = [
                {
                    "completed": true,
                    "completed_at": "2016-08-21T14:36:38+02:00",
                    created_at: "2016-08-10T14:36:38+02:00",
                    "points": 200,
                    "name": "name",
                    "description": "description"
                },
                {
                    completed: true,
                    completed_at: "2016-08-23T14:36:38+02:00",
                    created_at: "2016-08-11T14:36:38+02:00",
                    points: 200,
                    "name": "name",
                    "description": "description"
                },
                {
                    completed: true,
                    completed_at: "2016-08-27T14:36:38+02:00",
                    created_at: "2016-08-12T14:36:38+02:00",
                    points: 200,
                    "name": "name",
                    "description": "description"
                },
                {
                    completed: false,
                    completed_at: null,
                    created_at: "2016-08-13T14:36:38+02:00",
                    points: 200,
                    "name": "name",
                    "description": "description"
                },
                {
                    completed: false,
                    completed_at: null,
                    created_at: "2016-08-14T14:36:38+02:00",
                    points: 200,
                    "name": "name",
                    "description": "description"
                },
                {
                    completed: false,
                    completed_at: null,
                    created_at: "2016-08-14T14:36:38+02:00",
                    points: 200,
                    "name": "name",
                    "description": "description"
                },
            ];

            _.each(test_data, function(data) {
                objectives.push(data);
            });

            // Group the points by date
            objectives = _.groupBy(objectives, function(objective) {
                return moment(objective.created_at).format('DD/MM/YY');
            });

            // Union all the objectives when time progresses
            _.each(objectives, function(objective, index) {
                if(previous_day_data.length) {
                    objective = _.union(previous_day_data, objective);
                }
                previous_day_data = objective;

                // Overwrite the objectives
                objectives[index] = objective;
            });

            // Adding all the values together
            _.each(objectives, function(group) {
                var reduced = _.reduce(group, function(memo, num) {
                    memo.date = _.last(group).created_at;

                    // Only add the points if the objective isnt completed yet OR
                    // if the completion date is after the group date
                    if(num.completed &&
                        moment(num.completed_at)
                        .isSameOrBefore(memo.date)
                    ) {
                        memo.points += 0;
                    } else {
                        memo.points += num.points;
                    }
                    return memo;
                }, { date: null, points: 0 });

                reduced.date = moment(reduced.date).format('DD/MM');
                // Add the item to the grapsh items
                console.log(reduced);
                objectives_graph_items.push(reduced);
            });

            for(i = 0; i <= course_duration; i++) {
                var date = moment(starting_date).add(i, 'day');
                var match = _.findWhere(
                    objectives_graph_items,
                    {date: date.format('DD/MM')}
                );
                if(match) {
                    previous_points = match.points;
                    objectives_graph_line.push(match.points);
                } else {
                    if(moment().isBefore(date)) {
                        objectives_graph_line.push(null);
                    } else {
                        objectives_graph_line.push(previous_points);
                    }
                }
            }

            setTimeout(function () {
                self.createExperienceChart(guild);
            }, 100);

        }

        // TODO
        // Update graph on success
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
                    guild.objectives.push(response);
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Objective ' + response.name + ' is added')
                        .position('bottom right')
                        .hideDelay(3000)
                    );
                }, function(error) {
                    // Err add objective
                });
            }, function() {
                // Err dialog
            });
        }

        // TODO
        // Update graph on success
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
            }, function(error) {
                // Err remove objective
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
                series: [
                    {
                        name: 'Remaining quest points',
                        data: objectives_graph_line,
                        color: '#cd2327'
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
