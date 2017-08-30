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
        Guild,
        localStorageService,
        STUDENT_ACCESS_LEVEL,
        LECTURER_ACCESS_LEVEL,
        COORDINATOR_ACCESS_LEVEL
    ) {

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.getWorlds = getWorlds;
        self.getGuilds = getGuilds;
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

        console.log(localStorageService.get('trello_user'));

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Broadcasts
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        $scope.$on('new-user-set', function() {
            self.user = Global.getUser();
            self.access = Global.getAccess();

            if(self.access === STUDENT_ACCESS_LEVEL) {
                self.getGuilds();
            }

            if(self.access === LECTURER_ACCESS_LEVEL || self.access === COORDINATOR_ACCESS_LEVEL) {
                self.getWorlds();
            }
        });

        $scope.$on('user-logged-out', function() {
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
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function getWorlds() {
            // First access the users local storage to get the worlds
            if(localStorageService.get('worlds')) {
                self.worlds = [];
                _.each(localStorageService.get('worlds'), function(world) {
                    self.worlds.push({id: world.id, name: world.name});
                });
                if(self.worlds.length >= 1) {
                    self.selected_world = _.first(self.worlds);
                }
                Global.setSelectedWorld(self.selected_world.id);
            }
            // Next lets get some worlds from the database
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

                localStorageService.set('worlds', self.worlds);
            })
            .catch(function(error) {
                console.log(error);
            });
        }

        function getGuilds() {
            // First access the users local storage to get the guilds
            if(localStorageService.get('guilds')) {
                self.guilds = [];
                _.each(localStorageService.get('guilds'), function(guild) {
                    self.guilds.push({id: guild.id, name: guild.name});
                });
                if(self.guilds.length >= 1) {
                    self.selected_guild = _.first(self.guilds);
                }
                Global.setSelectedGuild(self.selected_guild.id);
            }
            // Next lets get some guilds from the database
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

                localStorageService.set('guilds', self.guilds);
            })
            .catch(function(error) {
                console.log(error);
            });
        }

        function toggleNavigation() {
            // Opens and closes navigation
            $mdSidenav('main__navigation').toggle();
        }

        function changeState() {
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
