(function () {
    'use strict';

    angular
        .module('cmd.progress')
        .controller('ProgressOverviewController', ProgressOverviewController);

    /** @ngInject */
    function ProgressOverviewController(
        $rootScope,
        Global,
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

            self.loading_page = false;

            console.log(self.worlds);
            self.selected_guild = _.first(_.first(self.worlds).guilds);
            console.log(self.selected_guild);

        }, function() {
            // Err
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Broadcasts
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        $rootScope.$on('world-changed', function(event, world) {
            console.log(world);
            self.selected_world = world;
        });


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    }

}());
