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
        DEBUG_ENABLED,
        $mdThemingProvider
    ) {
        $urlRouterProvider.otherwise('/');

        $logProvider.debugEnabled(DEBUG_ENABLED);

        $compileProvider.debugInfoEnabled(DEBUG_ENABLED);

        localStorageServiceProvider.setPrefix('cmd');

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Build a CMD theme
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        var cmd_palette = $mdThemingProvider.extendPalette('amber', {
            // Define extra settings which has to differ from the default amber template
            'contrastDefaultColor': 'light',
        });

        var cmd_palette_contrast = $mdThemingProvider.extendPalette('purple', {
            // Define extra settings which has to differ from the default amber template
            // 'contrastDefaultColor': 'light',
        });

        $mdThemingProvider
            .definePalette('cmd', cmd_palette);

        $mdThemingProvider
            .definePalette('cmdContrast', cmd_palette_contrast);

        $mdThemingProvider
            .theme('default')
            .primaryPalette('cmd')
            .accentPalette('cmdContrast')
        ; // End of theming

    }

}());
