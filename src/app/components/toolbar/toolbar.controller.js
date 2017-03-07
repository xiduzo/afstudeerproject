(function () {
    'use strict';

    angular
        .module('cmd.components')
        .controller('Toolbarcontroller', Toolbarcontroller);

    /** @ngInject */
    function Toolbarcontroller(
        $state,
        $scope,
        $mdSidenav,
        Global,
        Account,
        World,
        Guild
    ) {

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.getWorldsAndGuilds = getWorldsAndGuilds;
        self.toggleNavigation = toggleNavigation;
        self.changeState = changeState;
        self.changeWorld = changeWorld;
        self.changeGuild = changeGuild;
        self.logout = logout;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.access = Global.getAccess();
        self.route_title = '';
        self.back_route = null;
        self.back_route_params = null;

        $scope.$on('user-changed', function() {
            self.user = Global.getUser();
            self.access = Global.getAccess();
        });

        $scope.$on('route-title', function(event, title) {
            self.route_title = title;
        });

        $scope.$on('back-route', function(event, route, params) {
            self.back_route = route;
            self.back_route_params = params;
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        if(self.user.id) {
            self.getWorldsAndGuilds();
        }

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Broadcasts
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        $scope.$on('user-changed', function() {
            self.user = Global.getUser();
            self.access = Global.getAccess();
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function getWorldsAndGuilds() {
            World.getWorldsOfGamemaster(self.user.id)
            .then(function(response) {
                self.worlds = [];
                self.selected_world = null;
                _.each(response.worlds, function(world) {
                    self.worlds.push({id: world.world.id, name: world.world.name});
                });

                if(self.worlds.length >= 1) {
                    self.selected_world = _.first(self.worlds);
                }
                Global.setSelectedWorld(self.selected_world.id);
            })
            .catch(function() {

            });

            Guild.getUserGuilds(self.user.id)
            .then(function(response) {
                self.guilds = [];
                self.selected_guild = null;
                _.each(response.guilds, function(guild) {
                    self.guilds.push({id: guild.guild.id, name: guild.guild.name});
                });

                if(self.guilds.length >= 1) {
                    self.selected_guild = _.first(self.guilds);
                }
                Global.setSelectedGuild(self.selected_guild.id);
            })
            .catch(function() {

            });
        }

        function toggleNavigation() {
            // Opens and closes navigation
            $mdSidenav('main__navigation').toggle();
        }

        function changeState() {
            var route = self.back_route;
            $state.go(self.back_route, self.back_route_params);
        }

        function changeWorld(world) {
            self.selected_world = world;
            Global.setSelectedWorld(world.id);
        }

        function changeGuild(guild) {
            self.selected_guild = guild;
            Global.setSelectedGuild(guild.id);
        }

        function logout() {
          // Close the navigation
          self.toggleNavigation();

          // Logout the user
          Account.logout();
        }

    }

}());
