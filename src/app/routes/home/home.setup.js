(function () {
    'use strict';

    angular
        .module('cmd.home', ['ui.router'])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {

        $stateProvider

            .state('base.home', {
                url: '/',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/home/home.html',
                        controller: 'HomeController',
                        controllerAs: 'homeCtrl'
                    }
                }
            })

            .state('base.home.dashboards', {
                url: 'dashboard',
                abstract: true
            })

            .state('base.home.dashboards.coordinator', {
                url: '/coordinator',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/coordinator/dashboard/dashboard.html',
                        controller: 'CoordinatorDashboardController',
                        controllerAs: 'coordinatorDashboardCtrl'
                    }
                }
            })

            .state('base.home.dashboards.lecturer', {
                url: '/lecturer',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/lecturer/dashboard/dashboard.html',
                        controller: 'LecturerDashboardController',
                        controllerAs: 'lecturerDashboardCtrl'
                    }
                }
            })

            .state('base.home.dashboards.student', {
                url: '/student',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/student/dashboard/dashboard.html',
                        controller: 'StudentDashboardController',
                        controllerAs: 'studentDashboardCtrl'
                    }
                }
            })

        ; // End of states

    }
})();
