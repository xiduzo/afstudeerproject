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
            return function(datetime, suffix) {
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

        .filter('positiveInteger', function() {
            return function(number) {
                return number < 0 ? 0 : number;
            };
        })

        .filter('empasizeSubject', function() {
            return function(sentence, subject) {
                return sentence.replace(subject, '<strong>'+subject+'</strong>');
                // return parseInt(number , 10);
            };
        })

        .filter('hexToRgba', function() {
            return function(hex, opacity) {
                hex = hex.replace('#','');
                return 'rgba('+parseInt(hex.substring(0,2), 16)+','+parseInt(hex.substring(2,4), 16)+','+parseInt(hex.substring(4,6), 16)+','+opacity/100+')';
            };
        })

        .filter('roundup5', function() {
            return function(number) {
                return (number%5)?number-number%5+5:number;
            };
        })

        .filter('momentDate', function() {
            return function(date, format) {
                return moment(date).format(format);
            };
        })

        .filter('daysToGo', function() {
            return function(date) {
              var end = moment(date);  // or whatever start date you have
              var today = moment().startOf('day');
              return Math.round(moment.duration(end - today).asDays());
            };
        })

        .filter('hoursToGo', function() {
            return function(date) {
              var end = moment(date);  // or whatever start date you have
              var today = moment();
              return Math.round(moment.duration(end - today).asHours());
            };
        })



    ; // End of filters

}());
