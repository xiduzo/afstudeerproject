(function () {
    'use strict';

    angular
        .module('filters', [])

        .filter('secondsToDateTime', function() {
            return function(seconds) {
                return new Date(1970, 0, 1).setSeconds(seconds);
            };
        })

        .filter('fullUserName', function() {
            return function(user) {
                if(user.surname_prefix) {
                    return user.first_name + ' ' + user.surname_prefix + ' ' + user.surname;
                } else {
                    return user.first_name + ' ' + user.surname;
                }
            };
        })

        .filter('fromNow', function() {
            return function(datetime) {
                return moment(datetime).fromNow();
            };
        })

        .filter('percentageToGrade', function() {
            return function(percentage) {
                return percentage / 10;
            };
        })

        .filter('roundToTwo', function() {
            return function(number) {
                return +(Math.round(number + "e+2")  + "e-2");
            };
        })

        .filter('parseInt', function() {
            return function(number) {
                if(!number) { return; }
                return parseInt(number , 10);
            };
        })

        .filter('empasizeSubject', function() {
            return function(sentence, subject) {
                return sentence.replace(subject, '<strong>'+subject+'</strong>');
                // return parseInt(number , 10);
            };
        })


    ; // End of filters

}());
