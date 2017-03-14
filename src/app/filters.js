(function () {
    'use strict';

    angular
        .module('filters', [])

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

        .filter('positiveInteger', function() {
            return function(number) {
                return number < 0 ? 0 : number;
            };
        })

        .filter('empasizeSubject', function() {
            return function(sentence, subject) {
                return sentence.replace(subject, '<strong>'+subject+'</strong>');
            };
        })

        .filter('hexToRgba', function() {
            return function(hex, opacity) {
                hex = hex.replace('#','');
                return 'rgba('+parseInt(hex.substring(0,2), 16)+','+parseInt(hex.substring(2,4), 16)+','+parseInt(hex.substring(4,6), 16)+','+opacity/100+')';
            };
        })

        .filter('roundUp5', function() {
            return function(number) {
                return (number % 5) ? number - number % 5 + 5 : number;
            };
        })

        .filter('momentDate', function() {
            return function(date, format) {
                return moment(date).format(format);
            };
        })

        .filter('daysToGo', function() {
            return function(date) {
              var end = moment(date);
              var today = moment().startOf('day');
              return Math.round(moment.duration(end - today).asDays() + 1); // Be sure to calculate the last day
            };
        })

        .filter('hoursToGo', function() {
            return function(date) {
              var end = moment(date);
              var today = moment();
              return Math.round(moment.duration(end - today).asHours() + 24); // Be sure to calculate the last day
            };
        })



    ; // End of filters

}());
