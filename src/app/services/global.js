(function () {
    'use strict';

    angular
        .module('cmd.services')
        .factory('Global', Global);

    /** @ngInject */
    function Global(localStorageService, Account) {

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
            setAccess: function(acces) {
                self.access = acces;
            },
            getAccess: function() {
                return self.access;
            },
            setCredentials: function(credentials) {
                self.credentials = credentials;
            },
            getCredentials: function() {
                return self.credentials;
            },
        };

        if(localStorageService.get('user')) {
            self.user = localStorageService.get('user');

            Account
                .getAccessLevel(self.user.uid)
                .then(function(response) {
                    self.access = response;
                });
        }

        return self.functions;

    }

}());
