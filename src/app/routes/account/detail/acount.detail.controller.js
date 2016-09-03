(function () {
    'use strict';

    angular
        .module('cmd.account')
        .controller('AccountDetailController', AccountDetailController);

    /** @ngInject */
    function AccountDetailController(
        Global,
        Guild,
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

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();

        // var average_score = {
        //     name: 'Average score',
        //     data: [
        //         Math.floor(Math.random() * 100),
        //         Math.floor(Math.random() * 100),
        //         Math.floor(Math.random() * 100),
        //         Math.floor(Math.random() * 100),
        //         Math.floor(Math.random() * 100)
        //     ],
        //     color: '#95a5a6',
        //     pointPlacement: 'on'
        // };

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
            var total_completed_quests = 0;

            // Calculate my chart
            _.each(response.guilds, function(guild) {
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
                pointPlacement: 'on'
            };

            Spiderchart.createChart(
                'container',
                '',
                350,
                350,
                65,
                // [average_score, my_scores],
                [my_scores],
                true,
                true,
                {
                    text: moment().format("DD/MM/YY HH:mm"),
                    href: ''
                }
            );

        }, function(error) {
            // Error get user guilds
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    }

}());
