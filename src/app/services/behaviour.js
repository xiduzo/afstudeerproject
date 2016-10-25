(function () {
    'use strict';

    angular
        .module('cmd.services')
        .factory('Behaviour', Behaviour);

    /** @ngInject */
    function Behaviour(
        $http,
        REST_API_URL
    ) {

        var services = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        services.addBehaviour = addBehaviour;
        services.getBehaviours = getBehaviours;
        services.removeBehaviour = removeBehaviour;
        services.addBehaviourRupeeReward = addBehaviourRupeeReward;
        services.addRupee = addRupee;
        services.patchRupeeAmount = patchRupeeAmount;

        return services;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function addBehaviour(behaviour) {
            return $http({
                url: REST_API_URL + 'behaviour/behaviour/',
                method: "POST",
                data: {
                    behaviour: behaviour.behaviour,
                    behaviour_type: behaviour.behaviour_type,
                    points: behaviour.points,
                }
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function getBehaviours() {
            return $http({
                url: REST_API_URL + 'behaviour/behaviour/',
                method: "GET"
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function removeBehaviour(behaviour) {
            return $http({
                url: REST_API_URL + 'behaviour/behaviour/' + behaviour + '/',
                method: "DELETE"
            })
            .then(function(response) {
                return response;
            }, function(error) {
                return error;
            });
        }

        function addBehaviourRupeeReward(behaviour, rupee, amount) {
            return $http({
                url: REST_API_URL + 'behaviour/behaviourReward/',
                method: "POST",
                data: {
                    behaviour: behaviour.url,
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

        function addRupee(user_in_guild, rupee) {
            return $http({
                url: REST_API_URL + 'guild/userGuildRupees/',
                method: "POST",
                data: {
                    user_in_guild: user_in_guild,
                    rupee: rupee.rupee,
                    amount: rupee.amount
                }
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function patchRupeeAmount(rupee) {
            return $http({
                url: REST_API_URL + 'guild/userGuildRupees/' + rupee.id+ '/',
                method: "PATCH",
                data: {
                    amount: rupee.amount
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
