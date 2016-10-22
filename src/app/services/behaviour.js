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
        services.getBehavours = getBehavours;
        services.removeBehaviour = removeBehaviour;

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

        function getBehavours() {
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


    }
}());
