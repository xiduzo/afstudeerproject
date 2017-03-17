(function () {
    'use strict';

    angular
        .module('cmd.base', [])
        .config(config)
        .run(run);

    /** @ngInject */
    function config(
        $stateProvider,
        $locationProvider
    ) {

        // add the needed routes to the state provider
        $stateProvider.state('base', {
            url: '',
            abstract: true,
            views: {
                '': {
                    templateUrl: 'app/routes/base/base.html',
                    controller: 'BaseController',
                    controllerAs: 'baseCtrl'
                }
            }
        });

        $locationProvider.html5Mode({
            enabled: true,
            // requireBase: false
        });

    }


    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
     *          Run Block              *
     *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    /** @ngInject */
    function run(
        $log,
        $rootScope,
        $state,
        $stateParams,
        Global
    ) {

        // Using underscore in html, how awsome
        $rootScope._ = _;

        // Set the global information on the rootScope
        $rootScope.Global = Global;

        $rootScope.$on('$stateChangeError', function () { // eslint ignore:line
            $log.error('Error while changing state', arguments);
        });

        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        $rootScope.$on('$stateChangeSuccess', function ($event, toState, toParams, fromState) {
            if($rootScope.Global.getAccess() < 1) {
              $state.go('base.account.login');
            }
            $rootScope.$previousState = !fromState.name ? {name: 'base.home', isRoot: true} : fromState;
        });

    }

})();
