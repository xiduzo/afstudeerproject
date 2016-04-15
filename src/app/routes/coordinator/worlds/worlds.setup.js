(function () {
    'use strict';

    angular
        .module('cmd.worlds', ['ui.router'])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {

        $stateProvider

            .state('base.worlds', {
                url: '/worlds',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/coordinator/worlds/worlds.html',
                        controller: 'WorldsController',
                        controllerAs: 'worldsCtrl'
                    }
                }
            })

        ; // End of states

    }
})();
