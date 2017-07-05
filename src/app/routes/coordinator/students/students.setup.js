(function () {
    'use strict';

    angular
        .module('cmd.students', ['ui.router'])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {

        $stateProvider

            .state('base.students', {
                url: '/students',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/coordinator/students/students.html',
                        controller: 'StudentsController',
                        controllerAs: 'studentsCtrl'
                    }
                }
            })

        ; // End of states

    }
})();
