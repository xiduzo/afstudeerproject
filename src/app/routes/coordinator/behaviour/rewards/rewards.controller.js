(function () {
    'use strict';

    angular
        .module('cmd.behaviour')
        .controller('RewardsController', RewardsController);

    /** @ngInject */
    function RewardsController(
        $mdDialog,
        Global,
        Reward,
        Notifications,
        LECTURER_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < LECTURER_ACCESS_LEVEL) {
            return Global.notAllowed();
        }

        Global.setRouteTitle('Rewards');
        Global.setRouteBackRoute(null);

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.addReward = addReward;
        self.removeReward = removeReward;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.access = Global.getAccess();
        self.rewards = [];

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Reward.getRewards()
        .then(function(response) {
            self.rewards = response;
            // console.log(response);
        })
        .catch(function(error) {
            console.log(error);
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function addReward(event) {
            $mdDialog.show({
                controller: 'addRewardController',
                controllerAs: 'addRewardCtrl',
                templateUrl: 'app/routes/coordinator/behaviour/rewards/new/new.html',
                targetEvent: event,
                clickOutsideToClose: true
            })
            .then(function(response) {
                if(!response.reward) {
                    return Notifications.simpleToast('Please enter an reward');
                }

                var rupees = response.rupees;

                response.reward_type = 1;

                Reward.addReward(response)
                .then(function(response) {
                    var reward = response;
                    reward.cost = [];

                    _.each(rupees, function(rupee) {
                        rupee.rupee = rupee.type;
                        Reward.addRewardRupeeCost(
                            reward,
                            rupee.type,
                            rupee.amount
                        )
                        .then(function(response) {
                            reward.cost.push(response);
                        })
                        .catch(function(error) {
                            console.log(error);
                        });
                    });

                    self.rewards.push(reward);
                    Notifications.simpleToast('Added new reward: ' + response.reward);
                })
                .catch(function(error) {
                    console.log(error);
                });
            })
            .catch(function() {
                // Closed
            });
        }

        function removeReward(reward) {
            Reward.removeReward(reward.id)
            .then(function(response) {
                self.rewards.splice(_.indexOf(self.rewards, reward), 1);
                Notifications.simpleToast('Removed rewards ' + reward.reward);
            })
            .catch(function(error) {
                console.log(error);
            });
        }


    }
}());
