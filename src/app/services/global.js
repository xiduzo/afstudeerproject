(function () {
    'use strict';

    angular
        .module('cmd.services')
        .factory('Global', Global);

    /** @ngInject */
    function Global(
        $mdToast,
        $state,
        $rootScope,
        localStorageService,
        Account
    ) {

        var self = this;

        self.user = {};
        self.access = null;
        self.active_page = '';

        self.functions = {
            setUser: function(user) {
                self.user = user;

                // Setting the user access level
                if(user.is_superuser) {
                    self.acccess = 3;
                } else if (user.is_staff) {
                    self.access = 2;
                } else {
                    self.access = 1;
                }
            },
            getUser: function() {
                return self.user;
            },
            clearUser: function() {
                self.access = 0;
                self.user = {};
            },
            getAccess: function() {
                return Number(self.access);
            },
            notAllowed: function() {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('You are not allowed to view this page')
                    .position('bottom right')
                    .hideDelay(3000)
                );
                $state.go('base.home');
            },
            noConnection: function() {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('There seems to be a problem establishing a database connection')
                    .position('bottom right')
                    .hideDelay(3000)
                );
            },
            statusCode: function(response) {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent(response.status+': '+response.statusText)
                    .position('bottom right')
                    .hideDelay(5000)
                );
            },
            setActivePage: function(page) {
                self.page = page;
            },
            getAcitvePage: function() {
                return self.page;
            }

        };

        if(localStorageService.get('user')) {
            self.user = localStorageService.get('user');

            // Account.getAccessLevel(self.user.uid)
            //     .then(function(response) {
            //         if(response.status === -1) {
            //             self.functions.noConnection();
            //             return;
            //         }
            //         if(response.is_superuser) {
            //             self.acccess = 3;
            //         } else if (response.is_staff) {
            //             self.access = 2;
            //         } else {
            //             self.access = 1;
            //         }
            //         self.access = 3;
            //     });
            self.access = 3;
            $state.go('base.home');
        }

        return self.functions;

    }

}());
