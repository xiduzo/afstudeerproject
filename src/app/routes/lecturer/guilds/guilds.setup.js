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
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/lecturer/guilds/guilds.html',
                        controller: 'GuildsController',
                        controllerAs: 'guildsCtrl'
                    }
                }
            })

        ; // End of states

    }
})();
