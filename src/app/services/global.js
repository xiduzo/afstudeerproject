(function () {
    'use strict';

    angular
        .module('cmd.services')
        .factory('Global', Global);

    /** @ngInject */
    function Global() {

        var self = this;

        self.data = {
            credentials: {
                username: '',
                password: ''
            },
            user: {
                data: {},
                access: null,
            }
        };

        return self;

    }

}());
