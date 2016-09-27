(function () {
    'use strict';

    angular
        .module('cmd.account')
        .controller('AccountDetailController', AccountDetailController);

    /** @ngInject */
    function AccountDetailController(
        Global,
        Guild,
        Quest,
        World,
        CMDChart,
        Spiderchart,
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
        self.createSpiderChart = createSpiderChart;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getUserGuilds(self.user.id)
        .then(function(response) {
            var my_scores = {
                interaction_design: 0,
                visual_interface_design: 0,
                frontend_development: 0,
                content_management: 0,
                project_management: 0,
            };
            var average = {
                interaction_design: 0,
                visual_interface_design: 0,
                frontend_development: 0,
                content_management: 0,
                project_management: 0,
            };
            var total_completed_quests = 0;
            var total_completed_quests_average = 0;
            self.user.worlds = [];

            // Calculate my chart
            _.each(response.guilds, function(guild) {
                self.user.worlds.push(guild.guild.world);
                _.each(guild.guild.quests, function(quest) {
                    if(quest.completed) {
                        total_completed_quests++;
                        my_scores.interaction_design += quest.quest.interaction_design;
                        my_scores.visual_interface_design += quest.quest.visual_interface_design;
                        my_scores.frontend_development += quest.quest.frontend_development;
                        my_scores.content_management += quest.quest.content_management;
                        my_scores.project_management += quest.quest.project_management;
                    }
                });
            });
            my_scores = _.map(my_scores, function(score) {
                return score / total_completed_quests;
            });
            my_scores = {
                name: 'My score',
                data: my_scores,
                color: '#FFCC00',
                fillOpacity: 1,
                pointPlacement: 'on',
                marker: { radius: 0 }
            };

            // console.log(self.user.worlds);
            self.user.worlds = _.groupBy(self.user.worlds, function(world) {
                return world.id;
            });

            // TODO
            // Fix good average calculations
            // Calculate the average
            _.each(self.user.worlds, function(world) {
                World.getWorld(world[0].id)
                .then(function(response) {
                    _.each(response.guilds, function(guild) {
                        // console.log(guild);
                        _.each(guild.quests, function(quest) {
                            if(quest.completed) {
                                total_completed_quests_average++;
                                average.interaction_design += quest.quest.interaction_design;
                                average.visual_interface_design += quest.quest.visual_interface_design;
                                average.frontend_development += quest.quest.frontend_development;
                                average.content_management += quest.quest.content_management;
                                average.project_management += quest.quest.project_management;
                            }
                        });
                    });
                    // // console.log(average, total_completed_quests_average);
                    var tmpAverage = _.map(average, function(score) {
                        return score / total_completed_quests_average;
                    });

                    tmpAverage = {
                        name: 'Average score',
                        data: tmpAverage,
                        lineWidth: 0,
                        color: 'rgb(190, 75, 75)',
                        fillOpacity: 0.5,
                        pointPlacement: 'on',
                        marker: { radius: 0 }
                    };

                    self.createSpiderChart(tmpAverage, my_scores);

                });
            });

        }, function(error) {
            // Error get user guilds
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function createSpiderChart(average, my_scores) {
            // Spiderchart.createChart(
            //     'container',
            //     '',
            //     350,
            //     350,
            //     65,
            //     [average, my_scores],
            //     true,
            //     true,
            //     {
            //         text: moment().format("DD/MM/YY HH:mm"),
            //         href: ''
            //     }
            // );
        }
        var user = {
            techniek: Math.random() * 30 + 40,
            interaction: Math.random() * 30 + 40,
            visual: Math.random() * 30 + 40
        };

        CMDChart.createChart('testContainer', user);

    }

}());
