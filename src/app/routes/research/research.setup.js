(function () {
    'use strict';

    angular
        .module('cmd.research', ['ui.router'])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {

        $stateProvider

            .state('base.research', {
                url: '/research',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/research/research.html',
                        controller: 'ResearchController',
                        controllerAs: 'researchCtrl'
                    }
                }
            })

        ; // End of states

    }
})();
