(function () {
    'use strict';

    angular.module('cmd.constants', [])

        .constant('DEBUG_ENABLED', true)
        .constant('LDAP_LOGIN_API', 'https://oege.ie.hva.nl/~boera006/ldap/index.php')
        // .constant('REST_API_URL', 'http://127.0.0.1:8000/api/')
        .constant('REST_API_URL', 'https://murmuring-citadel-56488.herokuapp.com/api/')

        .constant('STUDENT_ACCESS_LEVEL', 1)
        .constant('LECTURER_ACCESS_LEVEL', 2)
        .constant('COORDINATOR_ACCESS_LEVEL', 3)
        .constant('COLORS', [
            '#2196F3',
            '#4CAF50',
            '#f44336',
            '#FFC107',
            '#795548',
            '#009688',
            '#FFEB3B',
            '#3F51B5',
            '#E91E63',
            '#03A9F4',
            '#FF9800',
            '#673AB7',
            '#FF5722',
            '#9C27B0',
            '#00BCD4',
            '#8BC34A',
            '#9E9E9E',
            '#607D8B',
        ])

        ; // End of constants

}());
