(function () {
    'use strict';

    angular
        .module('cmd.progress')
        .controller('ProgressOverviewController', ProgressOverviewController);

    /** @ngInject */
    function ProgressOverviewController(
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
        function patchQuest(quest) {
            console.log(quest);
            Guild.patchQuest(quest)
            .then(function(response) {
                Notifications.simpleToast('Patched assessment');
            }, function(error) {
                // Err patch quest completion status
            });
        }

    }

}());
