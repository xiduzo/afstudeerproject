(function () {
    'use strict';

    angular
        .module('cmd.progress', ['ui.router'])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {

        $stateProvider

            .state('base.progress', {
                url: '/progress',
                abstract: true
            })

            .state('base.progress.overview', {
                url: '/overview',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/lecturer/progress/overview/overview.html',
                        controller: 'ProgressOverviewController',
                        controllerAs: 'progressOverviewCtrl'
                    }
                }
            })

        ; // End of states

    }
})();
