(function () {
    'use strict';

    angular
        .module('cmd.lecturers', ['ui.router'])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {

        $stateProvider

            .state('base.lecturers', {
                url: '/lecturers',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/coordinator/lecturers/lecturers.html',
                        controller: 'LecturersController',
                        controllerAs: 'lecturersCtrl'
                    }
                }
            })

        ; // End of states

    }
})();
