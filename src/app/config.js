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
        ngOnboardingDefaultsProvider,
        ScrollBarsProvider,
        cfpLoadingBarProvider,
        TrelloApiProvider,
        DEBUG_ENABLED,
        TRELLO_KEY,
        TRELLO_SECRET
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
            .definePalette('cmd', {
                // 'contrastDefaultColor': 'light',
                // 'default': 'FFCC00' // #FFCC00
                // Im color blind, not that creative with colors
                '50':   'FFF8E1', // #FFF8E1
                '100':  'FFECB3', // #FFECB3
                '200':  'FFE082', // #FFE082
                '300':  'FFD54F', // #FFD54F
                '400':  'FFCA28', // #FFCA28
                '500':  'FFCC00', // #FFCC00
                '600':  'FFB300', // #FFB300
                '700':  'FFA000', // #FFA000
                '800':  'FF8F00', // #FF8F00
                '900':  'FF6F00', // #FF6F00
                'A100': 'FFE57F', // #FFE57F
                'A200': 'FFD740', // #FFD740
                'A400': 'FFC400', // #FFC400
                'A700': 'FFAB00', // #FFAB00
                'contrastDefaultColor': 'light',
                'default': 'FFCC00' // #FFCC00
            })
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
            // Material icons @ https://design.google.com/icons/
            .icon('menu_light', './assets/icons/material/ic_menu_white_48px.svg', 48)
            .icon('menu_dark', './assets/icons/material/ic_menu_black_48px.svg', 48)
            .icon('person_light', './assets/icons/material/ic_person_white_48px.svg', 48)
            .icon('person_dark', './assets/icons/material/ic_person_black_48px.svg', 48)
            .icon('dashboard_light', './assets/icons/material/ic_dashboard_white_48px.svg', 48)
            .icon('dashboard_dark', './assets/icons/material/ic_dashboard_black_48px.svg', 48)
            .icon('timeline_light', './assets/icons/material/ic_timeline_white_48px.svg', 48)
            .icon('timeline_dark', './assets/icons/material/ic_timeline_black_48px.svg', 48)
            .icon('school_light', './assets/icons/material/ic_school_white_48px.svg', 48)
            .icon('school_dark', './assets/icons/material/ic_school_black_48px.svg', 48)
            .icon('build_light', './assets/icons/material/ic_build_white_48px.svg', 48)
            .icon('build_dark', './assets/icons/material/ic_build_black_48px.svg', 48)
            .icon('gavel_light', './assets/icons/material/ic_gavel_white_48px.svg', 48)
            .icon('gavel_dark', './assets/icons/material/ic_gavel_black_48px.svg', 48)
            .icon('settings_light', './assets/icons/material/ic_settings_white_48px.svg', 48)
            .icon('settings_dark', './assets/icons/material/ic_settings_black_48px.svg', 48)
            .icon('group_light', './assets/icons/material/ic_group_white_48px.svg', 48)
            .icon('group_dark', './assets/icons/material/ic_group_black_48px.svg', 48)
            .icon('guild_light', './assets/icons/material/ic_security_white_48px.svg', 48)
            .icon('guild_dark', './assets/icons/material/ic_security_black_48px.svg', 48)
            .icon('world_light', './assets/icons/material/ic_public_white_48px.svg', 48)
            .icon('world_dark', './assets/icons/material/ic_public_black_48px.svg', 48)
            .icon('pencil_light', './assets/icons/material/ic_create_white_48px.svg', 48)
            .icon('pencil_dark', './assets/icons/material/ic_create_black_48px.svg', 48)
            .icon('eye_light', './assets/icons/material/ic_visibility_white_48px.svg', 48)
            .icon('eye_dark', './assets/icons/material/ic_visibility_black_48px.svg', 48)
            .icon('book_light', './assets/icons/material/ic_book_white_48px.svg', 48)
            .icon('book_dark', './assets/icons/material/ic_book_black_48px.svg', 48)
            .icon('world_light', './assets/icons/material/ic_public_white_48px.svg', 48)
            .icon('world_dark', './assets/icons/material/ic_public_black_48px.svg', 48)
            .icon('help_light', './assets/icons/material/ic_help_white_48px.svg', 48)
            .icon('help_dark', './assets/icons/material/ic_help_black_48px.svg', 48)
            .icon('delete_light', './assets/icons/material/ic_delete_white_48px.svg', 48)
            .icon('delete_dark', './assets/icons/material/ic_delete_black_48px.svg', 48)
            .icon('research_light', './assets/icons/material/ic_polymer_white_48px.svg', 48)
            .icon('research_dark', './assets/icons/material/ic_polymer_black_48px.svg', 48)
            .icon('refresh_light', './assets/icons/material/ic_autorenew_white_48px.svg', 48)
            .icon('refresh_dark', './assets/icons/material/ic_autorenew_black_48px.svg', 48)
            .icon('back_light', './assets/icons/material/ic_arrow_back_white_48px.svg', 48)
            .icon('back_dark', './assets/icons/material/ic_arrow_back_black_48px.svg', 48)
            .icon('more_vert_light', './assets/icons/material/ic_more_vert_white_48px.svg', 48)
            .icon('more_vert_dark', './assets/icons/material/ic_more_vert_black_48px.svg', 48)
            .icon('add_light', './assets/icons/material/ic_add_white_48px.svg', 48)
            .icon('add_dark', './assets/icons/material/ic_add_black_48px.svg', 48)
            .icon('key_light', './assets/icons/material/ic_vpn_key_white_48px.svg', 48)
            .icon('key_dark', './assets/icons/material/ic_vpn_key_black_48px.svg', 48)
            .icon('done_light', './assets/icons/material/ic_done_white_48px.svg', 48)
            .icon('done_dark', './assets/icons/material/ic_done_black_48px.svg', 48)
            .icon('add_person_light', './assets/icons/material/ic_person_add_white_48px.svg', 48)
            .icon('add_person_dark', './assets/icons/material/ic_person_add_black_48px.svg', 48)
            .icon('close_light', './assets/icons/material/ic_close_white_48px.svg', 48)
            .icon('close_dark', './assets/icons/material/ic_close_black_48px.svg', 48)
            .icon('rules_light', './assets/icons/material/ic_receipt_white_48px.svg', 48)
            .icon('rules_dark', './assets/icons/material/ic_receipt_black_48px.svg', 48)
            .icon('warning_light', './assets/icons/material/ic_report_problem_white_48px.svg', 48)
            .icon('warning_dark', './assets/icons/material/ic_report_problem_black_48px.svg', 48)
            .icon('external_link_light', './assets/icons/material/ic_open_in_new_white_48px.svg', 48)
            .icon('external_link_dark', './assets/icons/material/ic_open_in_new_black_48px.svg', 48)
            .icon('list_light', './assets/icons/material/ic_list_white_48px.svg', 48)
            .icon('list_dark', './assets/icons/material/ic_list_black_48px.svg', 48)
            .icon('remove_light', './assets/icons/material/ic_remove_white_48px.svg', 48)
            .icon('remove_dark', './assets/icons/material/ic_remove_black_48px.svg', 48)
            .icon('activity_light', './assets/icons/material/ic_storage_white_48px.svg', 48)
            .icon('activity_dark', './assets/icons/material/ic_storage_black_48px.svg', 48)
            .icon('clock_light', './assets/icons/material/ic_query_builder_white_48px.svg', 48)
            .icon('clock_dark', './assets/icons/material/ic_query_builder_black_48px.svg', 48)
            .icon('person_outline_light', './assets/icons/material/ic_person_outline_white_48px.svg', 48)
            .icon('person_outline_dark', './assets/icons/material/ic_person_outline_black_48px.svg', 48)
            .icon('again_light', './assets/icons/material/ic_cached_white_48px.svg', 48)
            .icon('again_dark', './assets/icons/material/ic_cached_black_48px.svg', 48)
            .icon('check_light', './assets/icons/material/ic_check_box_white_24px.svg', 24)
            .icon('check_dark', './assets/icons/material/ic_check_box_black_24px.svg', 24)
            .icon('uncheck_light', './assets/icons/material/ic_check_box_outline_blank_white_24px.svg', 24)
            .icon('uncheck_dark', './assets/icons/material/ic_check_box_outline_blank_black_24px.svg', 24)
            .icon('list_light', './assets/icons/material/ic_list_white_48px.svg', 48)
            .icon('list_dark', './assets/icons/material/ic_list_black_48px.svg', 48)
            .icon('feedback_light', './assets/icons/material/ic_feedback_white_48px.svg', 48)
            .icon('feedback_dark', './assets/icons/material/ic_feedback_black_48px.svg', 48)
            .icon('group_work_light', './assets/icons/material/ic_group_work_white_48px.svg', 48)
            .icon('group_work_dark', './assets/icons/material/ic_group_work_black_48px.svg', 48)
            .icon('description_light', './assets/icons/material/ic_description_white_48px.svg', 48)
            .icon('description_dark', './assets/icons/material/ic_description_black_48px.svg', 48)
            .icon('lightbulb_light', './assets/icons/material/ic_lightbulb_outline_white_48px.svg', 48)
            .icon('lightbulb_dark', './assets/icons/material/ic_lightbulb_outline_black_48px.svg', 48)
            .icon('work_light', './assets/icons/material/ic_work_white_48px.svg', 48)
            .icon('work_dark', './assets/icons/material/ic_work_black_48px.svg', 48)
            .icon('loyalty_light', './assets/icons/material/ic_loyalty_white_48px.svg', 48)
            .icon('loyalty_dark', './assets/icons/material/ic_loyalty_black_48px.svg', 48)
            .icon('redeem_light', './assets/icons/material/ic_redeem_white_48px.svg', 48)
            .icon('redeem_dark', './assets/icons/material/ic_redeem_black_48px.svg', 48)
            .icon('star_light', './assets/icons/material/ic_star_white_48px.svg', 48)
            .icon('star_dark', './assets/icons/material/ic_star_black_48px.svg', 48)
            .icon('star_border_light', './assets/icons/material/ic_star_border_white_48px.svg', 48)
            .icon('star_border_dark', './assets/icons/material/ic_star_border_black_48px.svg', 48)
            .icon('move_horizontal_light', './assets/icons/material/ic_swap_horiz_white_48px.svg', 48)
            .icon('move_horizontal_dark', './assets/icons/material/ic_swap_horiz_black_48px.svg', 48)
            .icon('expand_more_light', './assets/icons/material/ic_expand_more_white_48px.svg', 48)
            .icon('expand_more_dark', './assets/icons/material/ic_expand_more_black_48px.svg', 48)
            .icon('pie_light', './assets/icons/material/ic_pie_chart_white_48px.svg', 48)
            .icon('pie_dark', './assets/icons/material/ic_pie_chart_black_48px.svg', 48)
            .icon('trending_up_light', './assets/icons/material/ic_trending_up_white_48px.svg', 48)
            .icon('trending_up_dark', './assets/icons/material/ic_trending_up_black_48px.svg', 48)
            .icon('trending_down_light', './assets/icons/material/ic_trending_down_white_48px.svg', 48)
            .icon('trending_down_dark', './assets/icons/material/ic_trending_down_black_48px.svg', 48)
            .icon('trending_flat_light', './assets/icons/material/ic_trending_flat_white_48px.svg', 48)
            .icon('trending_flat_dark', './assets/icons/material/ic_trending_flat_black_48px.svg', 48)
            .icon('history_light', './assets/icons/material/ic_history_white_48px.svg', 48)
            .icon('history_dark', './assets/icons/material/ic_history_black_48px.svg', 48)
            .icon('comment_light', './assets/icons/material/ic_comment_white_48px.svg', 48)
            .icon('comment_dark', './assets/icons/material/ic_comment_black_48px.svg', 48)
            .icon('attachment_light', './assets/icons/material/ic_attach_file_white_48px.svg', 48)
            .icon('attachment_dark', './assets/icons/material/ic_attach_file_black_48px.svg', 48)
            .icon('event_light', './assets/icons/material/ic_event_white_48px.svg', 48)
            .icon('event_dark', './assets/icons/material/ic_event_black_48px.svg', 48)
            .icon('date_range_light', './assets/icons/material/ic_date_range_white_48px.svg', 48)
            .icon('date_range_dark', './assets/icons/material/ic_date_range_black_48px.svg', 48)

            // CMD icons @ https://www.dropbox.com/sh/n70kz7yya6yjv1o/AAA8h2z88jer3-1KvSsVTma2a/Iconen?dl=0
            .icon('cmd_enter', './assets/icons/cmd/enter.svg', 48)
            .icon('cmd_unicorn', './assets/icons/cmd/unicorn.svg', 48)
            .icon('cmd_book', './assets/icons/cmd/book.svg', 48)
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
            "default": "retro"
        };

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Onboarding
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        ngOnboardingDefaultsProvider.set({
            closeButtonText: '',
            overlayOpacity: 0.8,
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Loading bar provier
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        // How many miliseconds before showing the loading bar
        cfpLoadingBarProvider.latencyThreshold = 100;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Trello
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        TrelloApiProvider.init({
            key: TRELLO_KEY,
            secret: TRELLO_SECRET,
            expiration: "never",
            scope: {read: true, write: false, account: true},
            name: 'CMD Athena'
        });


    }
}());
