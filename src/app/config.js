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
        localStorageServiceProvider,
        DEBUG_ENABLED
    ) {
        $urlRouterProvider.otherwise('/');

        $logProvider.debugEnabled(DEBUG_ENABLED);

        $compileProvider.debugInfoEnabled(DEBUG_ENABLED);

        localStorageServiceProvider.setPrefix('cmd');

    }

}());
