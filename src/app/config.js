(function () {
    'use strict';

    angular
        .module('cmd.config', ['cmd.constants'])
        .config(config);

    /** @ngInject */
    function config(
        $compileProvider,
        $logProvider,
        $mdThemingProvider,
        $mdIconProvider,
        $urlRouterProvider,
        gravatarServiceProvider,
        localStorageServiceProvider,
        ScrollBarsProvider,
        DEBUG_ENABLED
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

        $mdThemingProvider
            // Add palettes
            .definePalette('cmd', $mdThemingProvider.extendPalette('amber', {
                'contrastDefaultColor': 'light',
            }))
            .definePalette('cmdContrast', {
                // Im color blind, not that creative with colors
                '50':   'FAFAFA', // #FAFAFA
                '100':  'F5F5F5', // #F5F5F5
                '200':  'EEEEEE', // #EEEEEE
                '300':  'E0E0E0', // #E0E0E0
                '400':  'BDBDBD', // #BDBDBD
                '500':  '9E9E9E', // #9E9E9E
                '600':  '757575', // #757575
                '700':  '616161', // #616161
                '800':  '424242', // #424242
                '900':  '212121', // #212121
                'A100': '757575', // #757575
                'A200': '616161', // #616161
                'A400': '424242', // #424242
                'A700': '212121', // #212121
                'contrastDefaultColor': 'light',
                'default': '000000' // #000000
            })

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
            .icon('build_light', './assets/icons/ic_build_white_48px.svg', 48)
            .icon('build_dark', './assets/icons/ic_build_black_48px.svg', 48)
            .icon('gavel_light', './assets/icons/ic_gavel_white_48px.svg', 48)
            .icon('gavel_dark', './assets/icons/ic_gavel_black_48px.svg', 48)
            .icon('settings_light', './assets/icons/ic_settings_white_48px.svg', 48)
            .icon('settings_dark', './assets/icons/ic_settings_black_48px.svg', 48)
            .icon('group_light', './assets/icons/ic_group_white_48px.svg', 48)
            .icon('group_dark', './assets/icons/ic_group_black_48px.svg', 48)
            .icon('guild_light', './assets/icons/ic_security_white_48px.svg', 48)
            .icon('guild_dark', './assets/icons/ic_security_black_48px.svg', 48)
            .icon('world_light', './assets/icons/ic_public_white_48px.svg', 48)
            .icon('world_dark', './assets/icons/ic_public_black_48px.svg', 48)
            .icon('pencil_light', './assets/icons/ic_create_white_48px.svg', 48)
            .icon('pencil_dark', './assets/icons/ic_create_black_48px.svg', 48)
            .icon('eye_light', './assets/icons/ic_visibility_white_48px.svg', 48)
            .icon('eye_dark', './assets/icons/ic_visibility_black_48px.svg', 48)
            .icon('book_light', './assets/icons/ic_book_white_48px.svg', 48)
            .icon('book_dark', './assets/icons/ic_book_black_48px.svg', 48)
            .icon('world_light', './assets/icons/ic_public_white_48px.svg', 48)
            .icon('world_dark', './assets/icons/ic_public_black_48px.svg', 48)
            .icon('help_light', './assets/icons/ic_help_white_48px.svg', 48)
            .icon('help_dark', './assets/icons/ic_help_black_48px.svg', 48)
            .icon('delete_light', './assets/icons/ic_delete_white_48px.svg', 48)
            .icon('delete_dark', './assets/icons/ic_delete_black_48px.svg', 48)
        ; // End icon provier

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Fancy scrollbars \o.0/
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        ScrollBarsProvider.defaults = {
            scrollButtons: {
                scrollAmount: 'auto',
                enable: false,
            },
            scrollInertia: 100,
            axis: 'y', // 'y' || 'x' || 'yx'
            theme: 'minimal-dark',
            autoHideScrollbar: true,
        };

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Gravatar
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        gravatarServiceProvider.secure = true;

        gravatarServiceProvider.defaults = {
            size: 100,

            // 404:       do not load any image if none is associated with the email hash, instead return an HTTP 404 (File Not Found) response
            // mm:        (mystery-man) a simple, cartoon-style silhouetted outline of a person (does not vary by email hash)
            // identicon: a geometric pattern based on an email hash
            // monsterid: a generated 'monster' with different colors, faces, etc
            // wavatar:   generated faces with differing features and backgrounds
            // retro:     awesome generated, 8-bit arcade-style pixelated faces
            // blank:     a transparent PNG image (border added to HTML below for demonstration purposes)
            "default": "monsterid"
        };


    }

}());
