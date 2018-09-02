(function () {
    'use strict';

    angular
        .module('cmd.services')
        .factory('Rules', Rules);

    /** @ngInject */
    function Rules(
        $http,
        REST_API_URL
    ) {

        var services = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        services.addRule = addRule;
        services.getRules = getRules;
        services.deleteRule = deleteRule;
        services.patchRule = patchRule;

        return services;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function addRule(rule) {
            return $http({
                url: REST_API_URL + 'rules/rules/',
                method: "POST",
                data: {
                    rule: rule.rule,
                    points: rule.points,
                    rule_type: rule.rule_type
                }
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function getRules() {
            return $http({
                url: REST_API_URL + 'rules/rules/',
                method: "GET"
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function deleteRule(rule) {
            return $http({
                url: REST_API_URL + 'rules/rules/' + rule + '/',
                method: "DELETE"
            })
            .then(function(response) {
                return response;
            }, function(error) {
                return error;
            });
        }

        function patchRule(rule) {
          return $http({
            url: REST_API_URL + 'rules/rules/' + rule.id + '/',
            method: "PATCH",
            data: {
                rule: rule.rule,
                points: rule.points,
                rule_type: rule.rule_type
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
