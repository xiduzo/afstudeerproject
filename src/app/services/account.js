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
        REST_API_URL
    ) {

        var service = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        service.login = login;
        service.logout = logout;
        service.checkForExistingUser = checkForExistingUser;
        service.setUser = setUser;
        service.getAccessLevel = getAccessLevel;
        service.createUser = createUser;
        service.getLecturers = getLecturers;

        return service;


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function login(username, password, context) {
            return $http({
                    url: LDAP_LOGIN_API,
                    method: "GET",
                    params: {
                        username: username,
                        password: password,
                        context: context
                    }
                })
                .then(function(response) {
                    return response.data;
                }, function(error) {
                    return error;
                });
        }

        function logout() {
            localStorageService.clearAll();
            $rootScope.Global.clearUser();
            $rootScope.$broadcast('user-changed');

            // Close the sidenav for the login page
            $mdSidenav('main__navigation').close();

            // Go back to the login page
            $state.go('base.account.login');
        }

        function checkForExistingUser(uid) {
            return $http({
                url: REST_API_URL + 'user/users/',
                method: "GET",
                params: {
                    uid: uid
                }
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function setUser(user) {
            localStorageService.set('user', user);
            $rootScope.Global.setUser(user);

            // Get the access level from the DB just to be sure no one will give himself access
            $rootScope.$broadcast('user-changed');
            $state.go('base.home');

        }

        function getAccessLevel(uid) {
            return $http({
                url: REST_API_URL + 'user/users/',
                method: "GET",
                params: {
                    uid: uid
                }
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function createUser(user) {
            return $http({
                url: REST_API_URL + 'user/users/',
                method: "POST",
                data: {
                    uid:               user.uid,
                    student_number:    user.hvastudentnumber,
                    email:             user.email,
                    initials:          user.initials,
                    first_name:        user.displayname,
                    surname:           user.surname,
                    gender:            user.gender,
                    is_staff:          user.access
                }
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function getLecturers(world) {
            return $http({
                url: REST_API_URL + 'user/users/',
                method: "GET",
                params: {
                    is_staff: 1
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
