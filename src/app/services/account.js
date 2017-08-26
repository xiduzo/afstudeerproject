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
        service.getStudents = getStudents;
        service.patchUser = patchUser;

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
            $rootScope.Global.clearUser();
            localStorageService.remove('user');
            localStorageService.remove('access');
            $rootScope.$broadcast('user-logged-out');

            // Close the sidenav for the login page
            $mdSidenav('main__navigation').close();

            // Go back to the login page
            $state.go('base.account.login');
        }

        function checkForExistingUser(email) {
            return $http({
                url: REST_API_URL + 'user/users/',
                method: "GET",
                params: {
                    email: email
                }
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function setUser(user, remember) {
            if(remember) {
                localStorageService.set('user', user);
            }
            // Get the access level from the DB just to be sure no one will give themselfs access
            $rootScope.$broadcast('new-user-login', user);
        }

        function getAccessLevel(email) {
            return $http({
                url: REST_API_URL + 'user/users/',
                method: "GET",
                params: {
                    email: email
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
                    student_number:    user.student_number,
                    email:             user.email,
                    initials:          user.initials,
                    first_name:        user.first_name,
                    surname_prefix:    user.surname_prefix,
                    surname:           user.surname,
                    gender:            user.gender,
                    is_staff:          user.is_staff,
                    is_superuser:      user.is_superuser
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

        function getStudents() {
            return $http({
                url: REST_API_URL + 'user/users/',
                method: "GET",
                params: {
                    is_staff: 0
                }
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function patchUser(user) {
            return $http({
                url: REST_API_URL + 'user/users/' + user.id + '/',
                method: "PATCH",
                data: {
                    is_superuser: user.is_superuser
                }
            })
            .then(function(response) {
                return response.data;
            })
            .catch(function(error) {
                return error;
            });
        }

    }

}());
