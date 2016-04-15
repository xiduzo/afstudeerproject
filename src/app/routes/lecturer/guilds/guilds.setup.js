(function () {
    'use strict';

    angular
        .module('cmd.guilds', ['ui.router'])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {

        $stateProvider

            .state('base.guilds', {
                url: '/guilds',
                abstract: true
            })

            .state('base.guilds.overview', {
                url: '/overview',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/lecturer/guilds/overview/overview.html',
                        controller: 'GuildsOverviewController',
                        controllerAs: 'guildsOverviewCtrl'
                    }
                }
            })

        ; // End of states

    }
})();
