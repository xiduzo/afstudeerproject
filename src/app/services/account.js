(function () {
    'use strict';

    angular
        .module('cmd.services')
        .factory('Account', Account);

    /** @ngInject */
    function Account($http, $q, LDAP_LOGIN_API, $log) {

        var service = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        service.login = login;


        return service;


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function login(username, password, context) {
            return $q(function(resolve, reject) {
                $http({
                    url: LDAP_LOGIN_API,
                    method: "GET",
                    params: {
                        username: username,
                        password: password,
                        context: context
                    }
                })
                .then(function(response) {
                    resolve(response.data);
                }, function(error) {
                    response.data.message = "Something went wrong during login, please try again.";
                    resolve(response.data);
                });
            });
        }

    }

}());
