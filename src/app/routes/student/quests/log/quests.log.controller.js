(function () {
    'use strict';

    angular
        .module('cmd.quests')
        .controller('QuestsLogController', QuestsLogController);

    /** @ngInject */
    function QuestsLogController(
        $rootScope,
        Global,
        Guild,
        World,
        Notifications,
        STUDENT_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < STUDENT_ACCESS_LEVEL) {
            Global.notAllowed();
            return;
        }

        Global.setRouteTitle('Assessments');
        Global.setRouteBackRoute(null);


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
        self.selected_guild = Global.getSelectedGuild();
        console.log(self.selected_guild);
        self.guilds = [];
        self.loading_page = true;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Broadcasts
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        $rootScope.$on('guild-changed', function(event, guild) {
            self.selected_guild = guild;
            Global.setRouteTitle('Assessments', _.findWhere(self.guilds, { id: self.selected_guild}).name);
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getUserGuilds(self.user.id)
        .then(function(response) {
            _.each(response.guilds, function(guildObject) {
                var guild = guildObject.guild;

                World.getWorld(guild.world.id)
                .then(function(response) {
                    var worldQuests = response.quests;
                    guild.active_quests = [];
                    guild.selected_quest = null;

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

                    // Adding the quests
                    _.each(guild.quests, function(quest) {
                        if(quest.quest.active) {
                            guild.active_quests.push(quest);
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
                            if(quest.active) {
                                guild.active_quests.push({
                                    completed: false,
                                    grade: null,
                                    guild: guild.url,
                                    quest: quest,
                                    quest_url: quest.url
                                });
                                Notifications.simpleToast('New assessments: ' + quest.name);
                                guild.selected_quest = _.min(guild.active_quests, function(quest) {
                                    return moment(quest.quest.created_at).unix();
                                });
                            }
                        }, function(error) {
                            // Err add quest
                        });
                    });

                    guild.selected_quest = _.min(guild.active_quests, function(quest) {
                        return moment(quest.quest.created_at).unix();
                    });

                    self.guilds.push(guild);

                    if( _.findWhere(self.guilds, { id: self.selected_guild})) {
                        Global.setRouteTitle('Assessments', _.findWhere(self.guilds, { id: self.selected_guild}).name);
                    }
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
        }

    }

}());
