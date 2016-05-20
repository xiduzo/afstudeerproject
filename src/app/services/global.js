(function () {
    'use strict';

    angular
        .module('cmd.services')
        .factory('Global', Global);

    /** @ngInject */
    function Global(
        $mdToast,
        $state,
        localStorageService,
        Account
    ) {

        var self = this;

        self.user = {};
        self.access = null;

        self.functions = {
            setUser: function(user) {
                self.user = user;
            },
            getUser: function() {
                return self.user;
            },
            setAccess: function(access) {
                self.access = access;
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
            }
        };

        if(localStorageService.get('user')) {
            self.user = localStorageService.get('user');

            Account.getAccessLevel(self.user.uid)
                .then(function(response) {
                    // self.access = response;
                    self.access = 2;
                });

            // self.access = 1;
            $state.go('base.home');
        }

        return self.functions;

    }

}());
