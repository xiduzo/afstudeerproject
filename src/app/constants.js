(function () {
    'use strict';

    angular.module('cmd.constants', [])

        .constant('DEBUG_ENABLED', true)
        .constant('LDAP_LOGIN_API', 'https://oege.ie.hva.nl/~boera006/ldap/index.php')
        .constant('API_URL', 'http://sanderboer.nl/school/afstuderen/php_services/')
        .constant('REST_API_URL', 'http://127.0.0.1:8000/api/')

        .constant('STUDENT_ACCESS_LEVEL', 1)
        .constant('LECTURER_ACCESS_LEVEL', 2)
        .constant('COORDINATOR_ACCESS_LEVEL', 3)

        ; // End of constants

}());
