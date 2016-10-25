(function () {
    'use strict';

    angular
        .module('cmd.stimulance', ['ui.router'])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {

        $stateProvider

            .state('base.stimulance', {
                url: '/stimulance',
                abstract: true
            })

            .state('base.stimulance.overview', {
                url: '/overview',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/lecturer/stimulance/overview/overview.html',
                        controller: 'StimulanceOverviewController',
                        controllerAs: 'stimulanceOverviewCtrl'
                    }
                }
            })


        ; // End of states

    }
})();
