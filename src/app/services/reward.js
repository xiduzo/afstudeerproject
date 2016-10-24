(function () {
    'use strict';

    angular
        .module('cmd.services')
        .factory('Reward', Reward);

    /** @ngInject */
    function Reward(
        $http,
        REST_API_URL
    ) {

        var services = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        services.addReward = addReward;
        services.getRewards = getRewards;
        services.removeReward = removeReward;
        services.addRewardRupeeCost = addRewardRupeeCost;

        return services;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function addReward(reward) {
            return $http({
                url: REST_API_URL + 'behaviour/reward/',
                method: "POST",
                data: {
                    reward: reward.reward,
                    reward_type: reward.reward_type,
                    points: reward.points,
                }
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function getRewards() {
            return $http({
                url: REST_API_URL + 'behaviour/reward/',
                method: "GET"
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function removeReward(reward) {
            return $http({
                url: REST_API_URL + 'behaviour/reward/' + reward + '/',
                method: "DELETE"
            })
            .then(function(response) {
                return response;
            }, function(error) {
                return error;
            });
        }

        function addRewardRupeeCost(reward, rupee, amount) {
            return $http({
                url: REST_API_URL + 'behaviour/rewardCost/',
                method: "POST",
                data: {
                    reward: reward.url,
                    rupee: rupee,
                    amount: amount
                }
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }


    }
}());
