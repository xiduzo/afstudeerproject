(function () {
    'use strict';

    angular
        .module('cmd.stimulance')
        .controller('StimulanceOverviewController', StimulanceOverviewController);

    /** @ngInject */
    function StimulanceOverviewController(
        $mdDialog,
        $filter,
        $rootScope,
        Behaviour,
        Global,
        World,
        Notifications,
        LECTURER_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < LECTURER_ACCESS_LEVEL) {
            return Global.notAllowed();
        }

        Global.setRouteTitle('Stimulance');
        Global.setRouteBackRoute(null);

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.rewardPlayer = rewardPlayer;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.access = Global.getAccess();
        self.selected_world = Global.getSelectedWorld();
        self.worlds = [];

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        World.getWorldsOfGamemaster(self.user.id)
        .then(function(response) {
            _.each(response.worlds, function(world) {
                world.players = [];
                world.id = world.world.id;
                _.each(world.world.guilds, function(guild) {
                    _.each(guild.members, function(member) {
                        member.full_name = $filter('fullUserName')(member.user);
                        world.players.push(member);
                    });
                });
                self.worlds.push(world);
            });

            if(_.findWhere(self.worlds, {id: self.selected_world})) {
                Global.setRouteTitle('Stimulance', _.findWhere(self.worlds, {id: self.selected_world}).world.name);
            }
        })
        .catch(function(error) {
            console.log(error);
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Broadcasts
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        $rootScope.$on('world-changed', function(event, world) {
            self.selected_world = world;
            Global.setRouteTitle('Stimulance', _.findWhere(self.worlds, {id: self.selected_world}).world.name);
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function rewardPlayer(player) {
            $mdDialog.show({
                controller: 'rewardPlayersController',
                controllerAs: 'rewardPlayersCtrl',
                templateUrl: 'app/routes/lecturer/stimulance/overview/reward/reward.html',
                targetEvent: event,
                clickOutsideToClose: true,
                locals: {
                    player: player
                }
            })
            .then(function(response) {
                // Only need the selected behaviours
                var selected_behaviours = _.where(response, {selected: true});

                // Add the rupees in the front-end
                _.each(selected_behaviours, function(behaviour) {
                    _.each(behaviour.rewards, function(reward) {
                        if(_.findWhere(player.rupees, { rupee: reward.rupee})) {
                            _.findWhere(player.rupees, { rupee: reward.rupee}).amount += reward.amount;
                        } else {
                            player.rupees.push(reward);
                        }
                    });
                });

                // And patch or add the rupees to the backend
                _.each(player.rupees, function(rupee) {
                    if(rupee.user_in_guild) {
                        Behaviour.patchRupeeAmount(rupee);
                    } else {
                        Behaviour.addRupee(player.id, rupee)
                        .then(function(response) {
                            rupee = response;
                        })
                        .catch(function(error) {
                            console.log(error);
                        });
                    }
                });

                Notifications.simpleToast('Added rupees to ' + player.full_name);
            })
            .catch(function() {
                // Closed
            });
        }


    }
}());
