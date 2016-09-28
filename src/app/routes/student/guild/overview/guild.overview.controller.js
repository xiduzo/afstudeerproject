(function () {
    'use strict';

    angular
        .module('cmd.guild')
        .controller('GuildOverviewController', GuildOverviewController);

    /** @ngInject */
    function GuildOverviewController(
        $mdDialog,
        $mdToast,
        $rootScope,
        Guild,
        Global,
        localStorageService,
        Notifications,
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
        self.createObjectivePointsChart = createObjectivePointsChart;
        self.addObjective = addObjective;
        self.removeObjective = removeObjective;
        self.buildGraphData = buildGraphData;
        self.updateStatus = updateStatus;
        self.guildHistoryUpdate = guildHistoryUpdate;
        self.assignMemberToObjective = assignMemberToObjective;
        self.removeObjectiveAssignment = removeObjectiveAssignment;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.selected_guild = Global.getSelectedGuild();
        self.guilds = [];
        self.loading_page = true;
        self.first_time = false;
        self.onboarding_enabled = false;
        self.onboarding_step_index = 0;
        self.onboarding_steps = [
            {
                title: "Oh, hello "+self.user.first_name+"!",
                description: "I can't help to notice this is your first time over here. Follow this steps and I'll show you how to get around.",
                position: "centered"
            },
            {
                title: "Group progress",
                position: "bottom",
                description: "Over here you will see your group progress, this will indicate the amount of work your team will have to do. It will also indicate the amount of work your group has been doing over time.",
                attachTo: "#step1",
                width: 300
            },
            {
                title: "Objectives",
                position: "top",
                description: "The group progress will be influenced by the groups' objectives. Objectives can be added by everybody in the group.",
                attachTo: "#step2",
            },
            {
                title: "Adding an objective",
                position: "centered",
                description: "By clicking on bottom right button you can add an objective for your group. Let's add one ourself, shall we?",
                attachTo: "#step3",
            },
        ];

        self.callback = function() {
            var guild = _.first(self.guilds);

            var tempObj = {
                name: 'My first objective',
                objective: 'This is my first objective, this objective was added automaticly by following the onboarding',
                points: 1
            };
            Guild.addObjective(guild.url, tempObj)
            .then(function(response) {
                var update = 'added a new objective: ' + '\'' +response.name + '\'';
                guild.objectives.unshift(response);
                self.guildHistoryUpdate(guild, update);
                self.onboarding_steps_2_enabled = false;
                nextSteps();
            }, function(error) {
                // Err add objective
            });
        };


        self.steps_2_callback = function() {
            var guild = _.first(self.guilds);
            var objective = _.first(guild.objectives);

            Guild.addObjectiveAssignment(objective.url, self.user.url)
            .then(function(response) {
                var update = 'assigned ' + self.user.first_name + ' to \'' + objective.name + '\'';
                self.guildHistoryUpdate(guild, update);
                Notifications.simpleToast(self.user.first_name + ' assigned to \'' + objective.name + '\'');
                objective.assignments.push({id: response.id, user: self.user, user_id: self.user.id});
                self.first_time = false;
                localStorageService.set('guild_overview_first_time', false);
            }, function(error) {
                // Err add objective assignment
            });
        };

        function nextSteps() {
            self.onboarding_steps_2_enabled = true;
            self.onboarding_steps_2_index = 0;
            self.onboarding_steps_2 = [
                {
                    title: "Assigning persons to an objective",
                    position: "top",
                    description: "As you can see, your new objective is added to the list. Let me assign you to this objective. You can assign multiple people to one objective, but for now let's just assign you.",
                    attachTo: "#step4",
                }
            ];
        }

        $rootScope.$on('guild-changed', function(event, guild) {
            self.selected_guild = guild;
            guild = _.find(self.guilds, function(guild) {
                return guild.id == self.selected_guild;
            });
            self.buildGraphData(guild);
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
                    if(response.start) {
                        guild.world_start_date = moment(response.start).format();
                    } else {
                        guild.world_start_date = moment(response.created_at).format();
                    }

                    guild.course_duration = response.course_duration;

                    self.guilds.push(guild);
                    self.buildGraphData(guild);

                    self.loading_page = false;

                    switch (localStorageService.get('guild_overview_first_time')) {
                        case true:
                            self.first_time = true;
                            self.onboarding_enabled = true;
                            break;
                        case false:
                            // You've been here before
                            break;
                        default:
                            localStorageService.set('guild_overview_first_time', true);
                            self.first_time = true;
                            self.onboarding_enabled = true;
                    }
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
            var course_duration = guild.course_duration || 7 * 6;
            var weeknumber = 1;
            var previous_points = null;
            var objectives_graph_line = [];
            var horizontal_axis = [];

            // Building the horizontal axis of the graph (date)
            for(var i = 0; i <= course_duration; i++) {
                if(i === 0 || i % 7 === 0) {
                    horizontal_axis.push('<b>Week ' + weeknumber + '</b>');
                    weeknumber++;
                } else {
                    horizontal_axis.push(moment(starting_date)
                        .add(i, 'days').format('DD/MM')
                    );
                }
                var tempObj = {
                    created_at: moment(starting_date)
                        .add(i, 'day').format()
                };
                objective_groups.push(tempObj);
            }

            guild.horizontal_axis = horizontal_axis;

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
                    if(objective_group && objective_group[0].points) {
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
                        // Only add the points if the objective isnt completed yet
                        // OR if the completion date is after the group date
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

                // If the date is after now
                if(moment().add(1, 'days').isSameOrBefore(date)) {
                    // don't show the chart
                    objectives_graph_line.push(null);
                } else if(match) {
                    previous_points = match.points;
                    objectives_graph_line.push(match.points);
                } else {
                    objectives_graph_line.push(previous_points);
                }
            }

            guild.graph_line = objectives_graph_line;

            setTimeout(function () {
                guild.graph_data_loaded = true;
                if(_.filter(objectives_graph_line, function(num) { return num !== null; }).length) {
                    self.createObjectivePointsChart(guild);
                } else {
                    guild.no_graph_data = true;
                }
            }, 100);
        }

        function addObjective(event, guild) {
            if(self.first_time) {
                self.onboarding_enabled = false;
                self.callback();
                return;
            }

            $mdDialog.show({
                controller: 'addObjectiveController',
                controllerAs: 'addObjectiveCtrl',
                templateUrl: 'app/routes/student/guild/overview/objectives/objectives.html',
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
                    Notifications.simpleToast('Fill in all the fields to add an objective');
                    return;
                }

                Guild.addObjective(guild.url, response)
                .then(function(response) {
                    var update = 'added a new objective: ' + '\'' +response.name + '\'';
                    guild.objectives.unshift(response);
                    self.guildHistoryUpdate(guild, update);
                    guild.no_graph_data = false;
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
                var update = 'removed objective: \'' + objective.name + '\'';
                guild.objectives.splice(guild.objectives.indexOf(objective), 1);
                self.guildHistoryUpdate(guild, update);
                if(!guild.objectives.length) {
                    guild.no_graph_data = true;
                }
            }, function(error) {
                // Err remove objective
            });
        }

        function updateStatus(guild, objective) {
            objective.completed_at = !objective.completed ?
                moment().utc().format() : null;
            Guild.patchObjective(objective)
            .then(function(response) {
                var update = response.completed ? 'done' : 'undone';
                update = 'marked objective \''+response.name+'\' as '+update;
                self.guildHistoryUpdate(guild, update);
            }, function(error) {
                // Err patch objective
            });
        }

        function guildHistoryUpdate(guild, update) {
            Guild.addHistoryUpdate(Global.getUser().url, guild.url, update)
            .then(function(response) {
                response.user = self.user;
                guild.history_updates.push(response);
                Notifications.simpleToast(update);
                self.buildGraphData(guild);
            }, function(error) {
                // Err adding history update
            });
        }

        function createObjectivePointsChart(guild) {
            $('#'+guild.id).highcharts({
                chart: { backgroundColor: 'rgba(0,0,0,0)' },
                title: { text: 'Progress of ' + guild.name },
                xAxis: {
                    categories: guild.horizontal_axis
                },
                yAxis: {
                    title: { text: 'Remaning task points' },
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
                        data: guild.graph_line,
                        color: '#616161'
                    }
                ],
                credits: {
                    text: moment().format("DD/MM/YY HH:MM"),
                    href: ''
                }
            });
        }

        function assignMemberToObjective(guild, objective) {
            _.each(objective.assignments, function(assignment) {
                assignment.user_id = assignment.user.id;
            });

            var members = guild.members;

            members = _.filter(guild.members, function(member) {
                var temp = _.where(objective.assignments, {user_id: member.id});
                if(temp.length === 0) {
                    return temp;
                }
            });


            $mdDialog.show({
                controller: 'AasController',
                controllerAs: 'aasCtrl',
                templateUrl: 'app/components/autocomplete_and_select/aas.html',
                targetEvent: event,
                clickOutsideToClose: true,
                locals: {
                    title: 'Assign to ' + objective.name,
                    subtitle: 'Please select who you would like to assign.',
                    about: 'group member',
                    players: members
                }
            })
            .then(function(response) {
                if(!response) {
                    return;
                }

                _.each(response, function(user) {
                    Guild.addObjectiveAssignment(objective.url, user.url)
                    .then(function(response) {
                        var update = 'assigned ' + user.first_name + ' to \'' + objective.name + '\'';
                        self.guildHistoryUpdate(guild, update);
                        Notifications.simpleToast(user.first_name + ' assigned to \'' + objective.name + '\'');
                        objective.assignments.push({id: response.id, user: user, user_id: user.id});
                    }, function(error) {
                        // Err add objective assignment
                    });
                });

            }, function() {
                // Err md dialog
            });
        }

        function removeObjectiveAssignment(guild, objective, assignment, index) {
            Guild.removeObjectiveAssignment(assignment.id)
            .then(function(response) {
                var update = 'removed ' + assignment.user.first_name + ' from \'' + objective.name + '\'';
                self.guildHistoryUpdate(guild, update);
                Notifications.simpleToast(assignment.user.first_name + ' removed from \'' + objective.name + '\'');
                objective.assignments.splice(index, 1);
            }, function(error) {
                // Err remove objective assignment
            });
        }

    }

}());
