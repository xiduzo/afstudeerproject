(function () {
    'use strict';

    angular
        .module('cmd.assessments', ['ui.router'])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {

        $stateProvider

            .state('base.assessments', {
                url: '/progress',
                abstract: true
            })

            .state('base.assessments.overview', {
                url: '/overview',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/lecturer/assessments/overview/overview.html',
                        controller: 'AssessmentsOverviewController',
                        controllerAs: 'assessmentsOverviewCtrl'
                    }
                }
            })

        ; // End of states

    }
})();
