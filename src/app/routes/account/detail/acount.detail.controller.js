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
        // Chart options
        var average_score = {
            name: 'Average score',
            data: [
                Math.floor(Math.random() * 100),
                Math.floor(Math.random() * 100),
                Math.floor(Math.random() * 100),
                Math.floor(Math.random() * 100),
                Math.floor(Math.random() * 100)
            ],
            color: '#95a5a6',
            pointPlacement: 'on'
        };

        var credits = {
            text: moment().format("DD/MM/YY HH:MM"),
            href: ''
        };

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
            var total_quests;

            // Calculate my chart
            _.each(response.guilds, function(guild) {
                total_quests = 0;
                _.each(guild.guild.quests, function(quest) {
                    if(quest.completed) {
                        total_quests++;
                        my_scores.interaction_design += quest.quest.interaction_design;
                        my_scores.visual_interface_design += quest.quest.visual_interface_design;
                        my_scores.frontend_development += quest.quest.frontend_development;
                        my_scores.content_management += quest.quest.content_management;
                        my_scores.project_management += quest.quest.project_management;
                    }
                });
            });
            my_scores = _.map(my_scores, function(score) {
                return score / total_quests;
            });

            my_scores = {
                name: 'My score',
                data: my_scores,
                color: '#FFCC00',
                pointPlacement: 'on'
            };

            Spiderchart.createChart('container', '', 400, 400, 65, [average_score, my_scores], true, true, credits);
        }, function(error) {
            // Error get user guilds
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    }

}());
