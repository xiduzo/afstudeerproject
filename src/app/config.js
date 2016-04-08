(function () {
    'use strict';

    angular
        .module('cmd.config', ['cmd.constants'])
        .config(config);

    /** @ngInject */
    function config(
        $urlRouterProvider,
        $logProvider,
        $compileProvider,
        localStorageServiceProvider
    ) {

        $urlRouterProvider.otherwise('/');

        $logProvider.debugEnabled(DEBUG_ENABLED);

        $compileProvider.debugInfoEnabled(DEBUG_ENABLED);

        localStorageServiceProvider.setPrefix('cmd');

    }

}());
