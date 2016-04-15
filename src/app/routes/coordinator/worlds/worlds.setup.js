(function () {
    'use strict';

    angular
        .module('cmd.worlds', ['ui.router'])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {

        $stateProvider

            .state('base.worlds', {
                url: '/account',
                abstract: true
            })

            .state('base.worlds.overview', {
                url: '/overview',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/coordinator/worlds/overview/overview.html',
                        controller: 'WorldsOverviewController',
                        controllerAs: 'worldsOverviewCtrl'
                    }
                }
            })

        ; // End of states

    }
})();
