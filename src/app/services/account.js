(function () {
    'use strict';

    angular
        .module('cmd.services')
        .factory('Account', Account);

    /** @ngInject */
    function Account(
        $http,
        $mdSidenav,
        $q,
        $rootScope,
        $state,
        localStorageService,
        LDAP_LOGIN_API,
        API_URL
    ) {

        var service = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        service.login = login;
        service.logout = logout;
        service.checkForExistingUser = checkForExistingUser;
        service.setUser = setUser;

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
                    reject(error);
                });
            });
        }

        function logout() {
            $rootScope.Global.setUser({});
            $rootScope.Global.setAccess(0);
            localStorageService.clearAll();
            $rootScope.$broadcast('user-changed');

            // Close the sidenav for the login page
            $mdSidenav('main__navigation').close();

            // Go back to the login page
            $state.go('base.account.login');
        }

        function checkForExistingUser(uid) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'validations/user_exists.php',
                    method: "GET",
                    params: {
                        uid: uid
                    }
                })
                .then(function(response) {
                    resolve(response.data);
                }, function(error) {
                    reject(error);
                });
            });
        }

        function setUser(user) {
            localStorageService.set('user', user);
            $rootScope.Global.setUser(user);

            // TODO
            // Add some kind of lecturer / coordinator check
            localStorageService.set('access', user.access);
            $rootScope.Global.setAccess(user.access);

            $rootScope.$broadcast('user-changed');
            $state.go('base.home');
        }

    }

}());
