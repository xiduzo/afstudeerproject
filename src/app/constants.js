(function () {
    'use strict';

    angular.module('cmd.constants', [])

        .constant('DEBUG_ENABLED', true)

        .constant('LDAP_LOGIN_API', 'https://oege.ie.hva.nl/~boera006/ldap/index.php')
        // .constant('REST_API_URL', 'https://murmuring-citadel-56488.herokuapp.com/api/')
        .constant('REST_API_URL', 'http://127.0.0.1:8000/api/')

        .constant('TRELLO_KEY', '85ea9af753540fb15c161d5eedd67a49')
        .constant('TRELLO_SECRET', '92b46d2d43997521d21894e6f88b843ddae5d903163d813356cfa7b376a85e2b')
        .constant('TRELLO_USER_ID', '5810c2cf05262a2228ff17ae')

        .constant('STUDENT_ACCESS_LEVEL', 1)
        .constant('LECTURER_ACCESS_LEVEL', 2)
        .constant('COORDINATOR_ACCESS_LEVEL', 3)

        .constant('MAX_STAR_RATING', 4)

        .constant('COLORS', [
            // CMD colors first
            '#FFCC00',
            '#00AD68',
            '#EB5D56',
            '#595959',

            // Other sexy colors nex
            '#00BCD4',
            '#3F51B5',
            '#8BC34A',
            '#f44336',
            '#FFEB3B',
            '#03A9F4',

            // And some backup colors when things are getting crazy
            '#FF9800',
            '#673AB7',
            '#4CAF50',
            '#795548',
            '#9C27B0',
            '#9E9E9E',
            '#607D8B',
            '#FFC107',
            '#009688',
            '#2196F3',
            '#FF5722',
            '#E91E63',
        ])

        ; // End of constants

}());
