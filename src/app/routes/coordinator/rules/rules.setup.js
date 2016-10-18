(function () {
    'use strict';

    angular
        .module('cmd.rules', ['ui.router'])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {

        $stateProvider

            .state('base.rules', {
                url: '/rules',
                abstract: true
            })

            .state('base.rules.overview', {
                url: '/overview',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/coordinator/rules/overview/overview.html',
                        controller: 'RulesOverviewController',
                        controllerAs: 'rulesOverviewCtrl'
                    }
                }
            })

        ; // End of states

    }
})();
