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
        toastr,
        localStorageService,
        STUDENT_ACCESS_LEVEL,
        LECTURER_ACCESS_LEVEL,
        COORDINATOR_ACCESS_LEVEL
    ) {

        var vm = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        vm.getWorlds = getWorlds;
        vm.getGuilds = getGuilds;
        vm.toggleNavigation = toggleNavigation;
        vm.changeState = changeState;
        vm.changeWorld = changeWorld;
        vm.changeGuild = changeGuild;
        vm.logout = logout;



        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        vm.user = Global.getUser();
        vm.access = Global.getAccess();
        vm.route_title = '';
        vm.back_route = null;
        vm.back_route_params = null;


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Broadcasts
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        $scope.$on('new-user-set', function() {
            vm.user = Global.getUser();
            vm.access = Global.getAccess();

            if(vm.access === STUDENT_ACCESS_LEVEL) {
                vm.getGuilds();
            }

            if(vm.access === LECTURER_ACCESS_LEVEL || vm.access === COORDINATOR_ACCESS_LEVEL) {
                vm.getWorlds();
            }
        });

        $scope.$on('user-logged-out', function() {
            vm.user = Global.getUser();
            vm.access = Global.getAccess();
        });

        $scope.$on('route-title', function(event, title) {
            vm.route_title = title;
        });

        $scope.$on('back-route', function(event, route, params) {
            vm.back_route = route;
            vm.back_route_params = params;
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function getWorlds() {
          Account.getWorlds(vm.user.id)
          .then(function(response) {
            vm.worlds = _.map(response.data, function(world) {
                return world.world;
            });

            if(vm.worlds.length >= 1) {
                vm.selected_world = _.first(vm.worlds);
            }

            Global.setSelectedWorld(vm.selected_world.id);

          })
          .catch(function(error) {
            toastr.error(error);
          });
        }

        function getGuilds() {
            // First access the users local storage to get the guilds
            if(localStorageService.get('guilds')) {
                vm.guilds = [];
                _.each(localStorageService.get('guilds'), function(guild) {
                    vm.guilds.push({id: guild.id, name: guild.name});
                });
                if(vm.guilds.length >= 1) {
                    vm.selected_guild = _.first(vm.guilds);
                }
                Global.setSelectedGuild(vm.selected_guild.id);
            }
            // Next lets get some guilds from the database
            Guild.getUserGuilds(vm.user.id)
            .then(function(response) {
                vm.guilds = [];
                vm.selected_guild = null;
                _.each(response.guilds, function(guild) {
                    vm.guilds.push({id: guild.guild.id, name: guild.guild.name});
                });

                if(vm.guilds.length >= 1) {
                    vm.selected_guild = _.first(vm.guilds);
                }
                Global.setSelectedGuild(vm.selected_guild.id);

                localStorageService.set('guilds', vm.guilds);
            })
            .catch(function(error) {
                //console.log(error);
            });
        }

        function toggleNavigation() {
            // Opens and closes navigation
            $mdSidenav('main__navigation').toggle();
        }

        function changeState() {
            $state.go(vm.back_route, vm.back_route_params);
        }

        function changeWorld(world) {
            vm.selected_world = world;
            Global.setSelectedWorld(world.id);
        }

        function changeGuild(guild) {
            vm.selected_guild = guild;
            Global.setSelectedGuild(guild.id);
        }

        function logout() {
          // Close the navigation
          vm.toggleNavigation();

          // Logout the user
          Account.logout();
        }

    }

}());
