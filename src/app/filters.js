(function () {
    'use strict';

    angular
        .module('secondsToDateTime', [])

        .filter('secondsToDateTime', function() {
            return function(seconds) {
                return new Date(1970, 0, 1).setSeconds(seconds);
            };
        })

        .filter('fullUserName', function() {
            return function(user) {
                return user.first_name + ' ' + user.surname;
            };
        })

        .filter('fromNow', function() {
            return function(datetime) {
                return moment(datetime).fromNow();
            };
        })

    ; // End of filters

}());
