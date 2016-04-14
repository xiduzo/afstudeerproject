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
        $mdThemingProvider,
        $mdIconProvider,
        ScrollBarsProvider
    ) {
        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Routing provier
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        $urlRouterProvider.otherwise('/');

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Log provider
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        $logProvider.debugEnabled(DEBUG_ENABLED);

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Compile provider
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        $compileProvider.debugInfoEnabled(DEBUG_ENABLED);

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            localStorage provider
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        localStorageServiceProvider
            .setPrefix('cmd')
            .setStorageCookieDomain(window.location)
            .setStorageCookie(60, '/')
        ; // End of local storage

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
            // Add palettes
            .definePalette('cmd', cmd_palette)
            .definePalette('cmdContrast', cmd_palette_contrast)

            // Set the theme to default
            .theme('default')

            // Set palletes
            .primaryPalette('cmd')
            .accentPalette('cmdContrast')
        ; // End of theming

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Building the icon set
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        // I actualy love this one b/c I won't be using
        // a fontset with 80% unused shit I don't need .__.
        $mdIconProvider
            .icon('menu_dark', './assets/icons/ic_menu_black_48px.svg', 48)
            .icon('menu_light', './assets/icons/ic_menu_white_48px.svg', 48)
            .icon('person_light', './assets/icons/ic_person_white_48px.svg', 48)
            .icon('person_dark', './assets/icons/ic_person_black_48px.svg', 48)
            .icon('dashboard_light', './assets/icons/ic_dashboard_white_48px.svg', 48)
            .icon('dashboard_dark', './assets/icons/ic_dashboard_black_48px.svg', 48)
            .icon('timeline_light', './assets/icons/ic_timeline_white_48px.svg', 48)
            .icon('timeline_dark', './assets/icons/ic_timeline_black_48px.svg', 48)
            .icon('school_light', './assets/icons/ic_school_white_48px.svg', 48)
            .icon('school_dark', './assets/icons/ic_school_black_48px.svg', 48)
        ; // End icon provier

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Fancy scrollbars \o.0/
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        ScrollBarsProvider.defaults = {
            scrollButtons: {
                scrollAmount: 'auto',
                enable: false,
            },
            scrollInertia: 400,
            axis: 'y', // 'y' || 'x' || 'yx'
            theme: 'minimal-dark',
            autoHideScrollbar: true,
        };


    }

}());
