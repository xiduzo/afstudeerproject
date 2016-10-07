(function () {
    'use strict';

    angular
        .module('cmd.assessments')
        .controller('AssessmentsOverviewController', AssessmentsOverviewController);

    /** @ngInject */
    function AssessmentsOverviewController(
        $rootScope,
        Global,
        Guild,
        Notifications,
        World,
        LECTURER_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < LECTURER_ACCESS_LEVEL) {
            Global.notAllowed();
            return;
        }

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.patchQuest = patchQuest;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.selected_world = Global.getSelectedWorld();
        self.worlds = [];
        self.loading_page = true;
        self.selected_guild = null;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        World.getWorldsOfGamemaster(Global.getUser().id)
        .then(function(response) {
            if(response.status >= 400) {
                Global.statusCode(response);
                return;
            }

            _.each(response.worlds, function(world) {
                self.worlds.push(world.world);
            });

            if(_.findWhere(self.worlds, {id: self.selected_world})) {
                self.selected_guild = _.first(_.findWhere(self.worlds, {id: self.selected_world}).guilds);
            } else {
                self.selected_guild = _.first(_.first(self.worlds).guilds);
            }

            self.loading_page = false;

        }, function() {
            // Err
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Broadcasts
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        $rootScope.$on('world-changed', function(event, world) {
            self.selected_world = world;
            self.selected_guild = _.first(_.findWhere(self.worlds, {id: world}).guilds);
        });


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function patchQuest(quest, type) {
            Guild.patchQuest(quest)
            .then(function(response) {
                var update = {
                    action: null,
                    type: null
                };

                Notifications.simpleToast('Patched assessment');

                if(type === 'completion') {
                    if(response.completed) {
                        update.action = ' set \'' + quest.quest.name + '\' to completed';
                        update.type = 9;
                    } else {
                        update.action = ' set \'' + quest.quest.name + '\' to uncomplete';
                        update.type = 10;
                    }
                    update.about = quest.quest.name;
                    Guild.addHistoryUpdate(self.user.url, response.guild, update);
                }

                if(type === 'grade') {
                    update.action = ' graded \'' + quest.quest.name + '\' with an ' + (quest.grade/10);
                    update.type = 7;
                    update.about = quest.quest.name;
                    Guild.addHistoryUpdate(self.user.url, response.guild, update);
                }

                // Guild history updates
            }, function(error) {
                // Err patch quest completion status
            });
        }

    }

}());
