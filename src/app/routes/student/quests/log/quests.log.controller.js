(function () {
    'use strict';

    angular
        .module('cmd.quests')
        .controller('QuestsLogController', QuestsLogController);

    /** @ngInject */
    function QuestsLogController(
        Global,
        Guild,
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
        self.selectObjective = selectObjective;
        self.selectQuest = selectQuest;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.guilds = [];

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getUserGuilds(self.user.id)
        .then(function(response) {
            _.each(response.guilds, function(guild) {
                guild = guild.guild;
                guild.selected_quest = _.first(guild.quests);
                self.guilds.push(guild);
            });
        },function(error) {
            // Err get user guilds
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function selectObjective(guild, objective) {
            guild.selected_objective = objective;
        }

        function selectQuest(guild, quest) {
            guild.selected_objective = null;
            guild.selected_quest = quest;
        }

    }

}());
