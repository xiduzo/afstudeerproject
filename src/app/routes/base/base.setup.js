(function () {
    'use strict';

    angular
        .module('cmd.base', [])
        .config(config)
        .run(run);

    /** @ngInject */
    function config(
        $stateProvider
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
        var initialState = null;
        // Using underscore in html, how awsome
        $rootScope._ = _;

        // Set the global information on the rootScope
        $rootScope.Global = Global;

        $rootScope.$on('$stateChangeError', function () {
            $log.error('Error while changing state', arguments);
        });

        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        $rootScope.$on('$stateChangeSuccess', function ($event, toState, toParams, fromState) {
            // Keep track of the state of the user after a refresh
            if(!initialState) {
              initialState = toState;
              Global.setToState(toState, toParams);
            }
            if($rootScope.Global.getAccess() < 1) {
                $state.go('base.account.login');
            }
            $rootScope.$previousState = !fromState.name ? {name: 'base.home', isRoot: true} : fromState;
        });

    }

})();
