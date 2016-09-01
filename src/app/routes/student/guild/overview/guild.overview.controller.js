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

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.guilds = [];

        var exp_data = [];
        var quest_points = [];
        var categories = [];
        var weeknumber = 0;
        var objectivesGraphLine = [];

        exp_data = [
            0, 20, 60, 60, 60, 60, 60,
            140, 155, 140, 140, 140, 140, 140,
            200, 230, 245, 245, 245, 245, 245,
            245, 270, 280, 280, 280, 280, 280,
            400, 430, 430, 430, 430, 430, 430,
            570, 580, 590, 590, 590, 590, 590,
            750, 780, 760, 760, 760, 760, 760,
            760
        ];

        for(var c = 0; c <= 49; c++) {
            if(c === 0 || c % 7 === 0) {
                categories.push('Week ' + weeknumber);
                weeknumber++;
            } else {
                categories.push(c);
            }
        }

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

                    // Building the scrum chart
                    var objectivePoints = [];
                    _.each(guild.objectives, function(objective) {
                        var tempObject = {
                            date: moment(objective.created_at).format(),
                            points: objective.points,
                            completed_at: objective.completed_at
                        };
                        objectivePoints.push(tempObject);
                    });

                    objectivePoints = _.groupBy(objectivePoints, function(op) {
                        return moment(op.date).format('DD/MM/YY');
                    });


                    // TODO
                    // Make the graph work
                    // Step 1: just add all the values with corrosponding date
                    // Step 2: adding the last days points to this days points
                    // Step 3: if you are on / over de completion date of an
                    // previous objetive -> substract the points of this
                    // Step 4: Add the new data on the chart (use only the
                    // objectivesGraphLine var)
                    // Step 5: drink beer, you deserve one ;)


                    // Adding all the values together
                    _.each(objectivePoints, function(objectivePoint) {
                        var reduced = { date: null, points: 0 };
                        _.each(objectivePoint, function(dateAndPoints) {
                            reduced = {
                                date: moment(dateAndPoints.date).format('DD/MM/YY'),
                                points: reduced.points + dateAndPoints.points
                            };
                        });
                        objectivesGraphLine.push(reduced);
                    });

                    console.log(objectivesGraphLine);

                    quest_points = [
                        1000, 1000, 970, 940, 930, 930, 930,
                        930, 930, 840, 840, 840, 760, 730,
                        700, 700, 700, 700, 600, 600, 600,
                        600, 600, 580, 520, 420, 420, 420,
                        420, 420, 420, 400, 400, 300, 200,
                        200, 200, 200, 200, 150, 150, 150,
                        150, 150, 150, 150, 150, 150, 100,
                        100
                    ];

                    // Finaly display all the data to the user
                    self.guilds.push(guild);

                    setTimeout(function () {
                        self.createExperienceChart(guild.id);
                    }, 100);
                });
            });
        }, function() {
            // Err get user guilds
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
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

        function removeObjective(guild, objective) {
            Guild.removeObjective(objective.id)
            .then(function(response) {
                guild.objectives.splice(guild.objectives.indexOf(objective), 1);
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Objective ' + response.name + ' removed')
                    .position('bottom right')
                    .hideDelay(3000)
                );
                console.log(response);
            }, function(error) {
                // Err remove objective
            });
        }

        function createExperienceChart(guild) {
            $('#'+guild).highcharts({

                chart: {
                    backgroundColor: 'rgba(0,0,0,0)'
                },

                title: {
                    text: 'Progress'
                },

                xAxis: {
                    title: {
                        text: 'Dagen'
                    },
                    categories: categories
                },

                yAxis: [
                    {
                        title: {
                            text: 'Experience'
                        },
                        min: 0
                    },
                    {
                        title: {
                            text: 'Remaning quest points'
                        },
                        min: 0,
                        opposite: true
                    },
                ],

                exporting: {
                    // Only show the exporting button when you have a higher access level than the student
                    enabled: false,
                },

                legend: {
                    enabled: false
                },

                tooltip: {
                    shared: false,
                    pointFormat: '{series.name}: <strong>{point.y:,.0f}</strong>'
                },

                series: [
                    {
                        name: 'Experience',
                        data: exp_data,
                        color: '#FFCC00'
                    },
                    {
                        name: 'Remaining quest points',
                        data: quest_points,
                        color: '#cd2327',
                        yAxis: 1
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
