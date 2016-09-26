(function () {
    'use strict';

    angular
        .module('cmd.quests')
        .controller('QuestsLogController', QuestsLogController);

    /** @ngInject */
    function QuestsLogController(
        Global,
        Guild,
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
        self.selectObjective = selectObjective;
        self.selectQuest = selectQuest;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.guilds = [];
        self.loading_page = true;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getUserGuilds(self.user.id)
        .then(function(response) {
            _.each(response.guilds, function(guildObject) {
                var guild = guildObject.guild;
                guild.selected_quest = _.first(guild.quests);

                World.getWorld(guild.world.id)
                .then(function(response) {
                    var worldQuests = response.quests;
                    guild.quest_urls = [];

                    // Quick fix bc I changed the serializer
                    _.each(guild.quests, function(quest) {
                        quest.quest_url = quest.quest.url;
                    });

                    // Filter out all the quest we allready have
                    // For this guild
                    worldQuests = _.filter(worldQuests, function(quest) {
                        if(!_.findWhere(guild.quests, {quest_url: quest.url})) {
                            return quest;
                        }
                    });

                    // Add all the new quests
                    _.each(worldQuests, function(quest) {
                        Guild.addQuest(guild.url, quest.url)
                        .then(function(response) {
                            var tempObj = {
                                id: response.url,
                                completed: response.completed,
                                quest: quest,
                            };
                            guild.quests.push(tempObj);
                        }, function(error) {
                            // Err add quest
                        });
                    });

                    guild.world_start_date = moment(response.start).format();
                    guild.course_duration = response.course_duration;
                    guild.active_quests = [];

                    _.each(guild.quests, function(quest) {
                        if(quest.quest.active) {
                            guild.active_quests.push(quest);
                        }
                    });

                    guild.selected_quest = _.first(guild.active_quests);

                    console.log(guild.active_quests);

                    self.guilds.push(guild);
                    self.loading_page = false;

                });
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
            console.log(guild.selected_quest);
        }

    }

}());
