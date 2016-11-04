(function () {
    'use strict';

    angular.module('cmd.constants', [])

        .constant('DEBUG_ENABLED', true)
        .constant('LDAP_LOGIN_API', 'https://oege.ie.hva.nl/~boera006/ldap/index.php')
        .constant('REST_API_URL', 'http://127.0.0.1:8000/api/')
        // .constant('REST_API_URL', 'https://murmuring-citadel-56488.herokuapp.com/api/')
        .constant('TRELLO_KEY', '85ea9af753540fb15c161d5eedd67a49')
        .constant('TRELLO_SECRET', '92b46d2d43997521d21894e6f88b843ddae5d903163d813356cfa7b376a85e2b')
        .constant('TRELLO_USER_ID', '5810c2cf05262a2228ff17ae')

        .constant('STUDENT_ACCESS_LEVEL', 1)
        .constant('LECTURER_ACCESS_LEVEL', 2)
        .constant('COORDINATOR_ACCESS_LEVEL', 3)
        .constant('COLORS', [
            '#00BCD4',
            '#8BC34A',
            '#673AB7',
            '#E91E63',
            '#3F51B5',
            '#009688',
            '#795548',
            '#f44336',
            '#2196F3',
            '#4CAF50',
            '#03A9F4',
            '#FF9800',
            '#FFEB3B',
            '#FF5722',
            '#9C27B0',
            '#FFC107',
            '#9E9E9E',
            '#607D8B',
        ])

        ; // End of constants

}());
