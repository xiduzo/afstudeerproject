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
                    templateUrl: 'app/routes/base/base.html'
                },
                'header@base': {
                    templateUrl: 'app/routes/base/header.html'
                },
                'footer@base': {
                    templateUrl: 'app/routes/base/footer.html'
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
        $stateParams
    ) {

        $rootScope.$on('$stateChangeError', function () { // eslint ignore:line
            $log.error('Error while changing state', arguments);
        });

        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        $rootScope.$on('$stateChangeSuccess', function ($event, toState, toParams, fromState) {
            if(!fromState.name) {
                $rootScope.$previousState = {name: 'base.home', isRoot: true};
            } else {
                $rootScope.$previousState = fromState;
            }
            $rootScope.$broadcast('state-loaded');
        });

    }

})();
