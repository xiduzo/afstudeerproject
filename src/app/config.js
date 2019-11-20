(function() {
  "use strict";

  angular.module("cmd.config", ["cmd.constants"]).config(config);

  /** @ngInject */
  function config(
    $httpProvider,
    $base64,
    $compileProvider,
    $logProvider,
    $mdThemingProvider,
    $mdIconProvider,
    $urlRouterProvider,
    $locationProvider,
    $translateProvider,
    gravatarServiceProvider,
    localStorageServiceProvider,
    cfpLoadingBarProvider,
    TrelloApiProvider,
    toastrConfig,
    DEBUG_ENABLED,
    TRELLO_KEY,
    TRELLO_SECRET,
    CREDENTIAL_USER,
    CREDENTIAL_PASS
  ) {
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Credentials
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    $httpProvider.defaults.headers.common["Authorization"] =
      "Basic " + $base64.encode(CREDENTIAL_USER + ":" + CREDENTIAL_PASS);
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Routing provider
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    $urlRouterProvider.otherwise("/");

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Location provider
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    // $locationProvider.html5Mode({
    //     enabled: true,
    //     // requireBase: false
    // });

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
      .setPrefix("cmd")
      .setStorageCookieDomain(window.location)
      .setStorageCookie(60, "/"); // End of local storage

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Build a CMD theme
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    $mdThemingProvider
      // Add palettes
      .definePalette("cmd", {
        "50": "FFF8E1", // #FFF8E1
        "100": "FFECB3", // #FFECB3
        "200": "FFE082", // #FFE082
        "300": "FFD54F", // #FFD54F
        "400": "FFCA28", // #FFCA28
        "500": "FFCC00", // #FFCC00
        "600": "FFB300", // #FFB300
        "700": "FFA000", // #FFA000
        "800": "FF8F00", // #FF8F00
        "900": "FF6F00", // #FF6F00
        A100: "FFE57F", // #FFE57F
        A200: "FFD740", // #FFD740
        A400: "FFC400", // #FFC400
        A700: "FFAB00", // #FFAB00
        contrastDefaultColor: "light",
        default: "FFCC00" // #FFCC00
      })
      .definePalette("cmdContrast", {
        // Im color blind, not that creative with colors
        "50": "FAFAFA", // #FAFAFA
        "100": "F5F5F5", // #F5F5F5
        "200": "EEEEEE", // #EEEEEE
        "300": "E0E0E0", // #E0E0E0
        "400": "BDBDBD", // #BDBDBD
        "500": "9E9E9E", // #9E9E9E
        "600": "757575", // #757575
        "700": "616161", // #616161
        "800": "424242", // #424242
        "900": "212121", // #212121
        A100: "757575", // #757575
        A200: "616161", // #616161
        A400: "424242", // #424242
        A700: "212121", // #212121
        contrastDefaultColor: "light",
        default: "000000" // #000000
      })

      // Set the theme to default
      .theme("default")

      // Set palletes
      .primaryPalette("cmd")
      .accentPalette("cmdContrast"); // End of theming

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Building the icon set
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    // I actualy love this one b/c I won't be using
    // a fontset with 80% unused shit I don't need .__.
    $mdIconProvider
      // Material icons @ https://design.google.com/icons/
      .icon("menu_light", "./assets/icons/material/ic_menu_white_48px.svg", 48)
      .icon("menu_dark", "./assets/icons/material/ic_menu_black_48px.svg", 48)
      .icon(
        "person_light",
        "./assets/icons/material/ic_person_white_48px.svg",
        48
      )
      .icon(
        "person_dark",
        "./assets/icons/material/ic_person_black_48px.svg",
        48
      )
      .icon(
        "dashboard_light",
        "./assets/icons/material/ic_dashboard_white_48px.svg",
        48
      )
      .icon(
        "dashboard_dark",
        "./assets/icons/material/ic_dashboard_black_48px.svg",
        48
      )
      .icon(
        "timeline_light",
        "./assets/icons/material/ic_timeline_white_48px.svg",
        48
      )
      .icon(
        "timeline_dark",
        "./assets/icons/material/ic_timeline_black_48px.svg",
        48
      )
      .icon(
        "school_light",
        "./assets/icons/material/ic_school_white_48px.svg",
        48
      )
      .icon(
        "school_dark",
        "./assets/icons/material/ic_school_black_48px.svg",
        48
      )
      .icon(
        "build_light",
        "./assets/icons/material/ic_build_white_48px.svg",
        48
      )
      .icon("build_dark", "./assets/icons/material/ic_build_black_48px.svg", 48)
      .icon(
        "gavel_light",
        "./assets/icons/material/ic_gavel_white_48px.svg",
        48
      )
      .icon("gavel_dark", "./assets/icons/material/ic_gavel_black_48px.svg", 48)
      .icon(
        "settings_light",
        "./assets/icons/material/ic_settings_white_48px.svg",
        48
      )
      .icon(
        "settings_dark",
        "./assets/icons/material/ic_settings_black_48px.svg",
        48
      )
      .icon(
        "group_light",
        "./assets/icons/material/ic_group_white_48px.svg",
        48
      )
      .icon("group_dark", "./assets/icons/material/ic_group_black_48px.svg", 48)
      .icon(
        "guild_light",
        "./assets/icons/material/ic_security_white_48px.svg",
        48
      )
      .icon(
        "guild_dark",
        "./assets/icons/material/ic_security_black_48px.svg",
        48
      )
      .icon(
        "world_light",
        "./assets/icons/material/ic_public_white_48px.svg",
        48
      )
      .icon(
        "world_dark",
        "./assets/icons/material/ic_public_black_48px.svg",
        48
      )
      .icon(
        "pencil_light",
        "./assets/icons/material/ic_create_white_48px.svg",
        48
      )
      .icon(
        "pencil_dark",
        "./assets/icons/material/ic_create_black_48px.svg",
        48
      )
      .icon(
        "eye_light",
        "./assets/icons/material/ic_visibility_white_48px.svg",
        48
      )
      .icon(
        "eye_dark",
        "./assets/icons/material/ic_visibility_black_48px.svg",
        48
      )
      .icon("book_light", "./assets/icons/material/ic_book_white_48px.svg", 48)
      .icon("book_dark", "./assets/icons/material/ic_book_black_48px.svg", 48)
      .icon(
        "world_light",
        "./assets/icons/material/ic_public_white_48px.svg",
        48
      )
      .icon(
        "world_dark",
        "./assets/icons/material/ic_public_black_48px.svg",
        48
      )
      .icon("help_light", "./assets/icons/material/ic_help_white_48px.svg", 48)
      .icon("help_dark", "./assets/icons/material/ic_help_black_48px.svg", 48)
      .icon(
        "delete_light",
        "./assets/icons/material/ic_delete_white_48px.svg",
        48
      )
      .icon(
        "delete_dark",
        "./assets/icons/material/ic_delete_black_48px.svg",
        48
      )
      .icon(
        "research_light",
        "./assets/icons/material/ic_polymer_white_48px.svg",
        48
      )
      .icon(
        "research_dark",
        "./assets/icons/material/ic_polymer_black_48px.svg",
        48
      )
      .icon(
        "refresh_light",
        "./assets/icons/material/ic_autorenew_white_48px.svg",
        48
      )
      .icon(
        "refresh_dark",
        "./assets/icons/material/ic_autorenew_black_48px.svg",
        48
      )
      .icon(
        "back_light",
        "./assets/icons/material/ic_arrow_back_white_48px.svg",
        48
      )
      .icon(
        "back_dark",
        "./assets/icons/material/ic_arrow_back_black_48px.svg",
        48
      )
      .icon(
        "more_vert_light",
        "./assets/icons/material/ic_more_vert_white_48px.svg",
        48
      )
      .icon(
        "more_vert_dark",
        "./assets/icons/material/ic_more_vert_black_48px.svg",
        48
      )
      .icon("add_light", "./assets/icons/material/ic_add_white_48px.svg", 48)
      .icon("add_dark", "./assets/icons/material/ic_add_black_48px.svg", 48)
      .icon(
        "key_light",
        "./assets/icons/material/ic_vpn_key_white_48px.svg",
        48
      )
      .icon("key_dark", "./assets/icons/material/ic_vpn_key_black_48px.svg", 48)
      .icon("done_light", "./assets/icons/material/ic_done_white_48px.svg", 48)
      .icon("done_dark", "./assets/icons/material/ic_done_black_48px.svg", 48)
      .icon(
        "add_person_light",
        "./assets/icons/material/ic_person_add_white_48px.svg",
        48
      )
      .icon(
        "add_person_dark",
        "./assets/icons/material/ic_person_add_black_48px.svg",
        48
      )
      .icon(
        "close_light",
        "./assets/icons/material/ic_close_white_48px.svg",
        48
      )
      .icon("close_dark", "./assets/icons/material/ic_close_black_48px.svg", 48)
      .icon(
        "rules_light",
        "./assets/icons/material/ic_receipt_white_48px.svg",
        48
      )
      .icon(
        "rules_dark",
        "./assets/icons/material/ic_receipt_black_48px.svg",
        48
      )
      .icon(
        "warning_light",
        "./assets/icons/material/ic_report_problem_white_48px.svg",
        48
      )
      .icon(
        "warning_dark",
        "./assets/icons/material/ic_report_problem_black_48px.svg",
        48
      )
      .icon(
        "external_link_light",
        "./assets/icons/material/ic_open_in_new_white_48px.svg",
        48
      )
      .icon(
        "external_link_dark",
        "./assets/icons/material/ic_open_in_new_black_48px.svg",
        48
      )
      .icon("list_light", "./assets/icons/material/ic_list_white_48px.svg", 48)
      .icon("list_dark", "./assets/icons/material/ic_list_black_48px.svg", 48)
      .icon(
        "remove_light",
        "./assets/icons/material/ic_remove_white_48px.svg",
        48
      )
      .icon(
        "remove_dark",
        "./assets/icons/material/ic_remove_black_48px.svg",
        48
      )
      .icon(
        "activity_light",
        "./assets/icons/material/ic_storage_white_48px.svg",
        48
      )
      .icon(
        "activity_dark",
        "./assets/icons/material/ic_storage_black_48px.svg",
        48
      )
      .icon(
        "clock_light",
        "./assets/icons/material/ic_query_builder_white_48px.svg",
        48
      )
      .icon(
        "clock_dark",
        "./assets/icons/material/ic_query_builder_black_48px.svg",
        48
      )
      .icon(
        "person_outline_light",
        "./assets/icons/material/ic_person_outline_white_48px.svg",
        48
      )
      .icon(
        "person_outline_dark",
        "./assets/icons/material/ic_person_outline_black_48px.svg",
        48
      )
      .icon(
        "again_light",
        "./assets/icons/material/ic_cached_white_48px.svg",
        48
      )
      .icon(
        "again_dark",
        "./assets/icons/material/ic_cached_black_48px.svg",
        48
      )
      .icon(
        "check_light",
        "./assets/icons/material/ic_check_box_white_24px.svg",
        24
      )
      .icon(
        "check_dark",
        "./assets/icons/material/ic_check_box_black_24px.svg",
        24
      )
      .icon(
        "uncheck_light",
        "./assets/icons/material/ic_check_box_outline_blank_white_24px.svg",
        24
      )
      .icon(
        "uncheck_dark",
        "./assets/icons/material/ic_check_box_outline_blank_black_24px.svg",
        24
      )
      .icon("list_light", "./assets/icons/material/ic_list_white_48px.svg", 48)
      .icon("list_dark", "./assets/icons/material/ic_list_black_48px.svg", 48)
      .icon(
        "feedback_light",
        "./assets/icons/material/ic_feedback_white_48px.svg",
        48
      )
      .icon(
        "feedback_dark",
        "./assets/icons/material/ic_feedback_black_48px.svg",
        48
      )
      .icon(
        "group_work_light",
        "./assets/icons/material/ic_group_work_white_48px.svg",
        48
      )
      .icon(
        "group_work_dark",
        "./assets/icons/material/ic_group_work_black_48px.svg",
        48
      )
      .icon(
        "description_light",
        "./assets/icons/material/ic_description_white_48px.svg",
        48
      )
      .icon(
        "description_dark",
        "./assets/icons/material/ic_description_black_48px.svg",
        48
      )
      .icon(
        "lightbulb_light",
        "./assets/icons/material/ic_lightbulb_outline_white_48px.svg",
        48
      )
      .icon(
        "lightbulb_dark",
        "./assets/icons/material/ic_lightbulb_outline_black_48px.svg",
        48
      )
      .icon("work_light", "./assets/icons/material/ic_work_white_48px.svg", 48)
      .icon("work_dark", "./assets/icons/material/ic_work_black_48px.svg", 48)
      .icon(
        "loyalty_light",
        "./assets/icons/material/ic_loyalty_white_48px.svg",
        48
      )
      .icon(
        "loyalty_dark",
        "./assets/icons/material/ic_loyalty_black_48px.svg",
        48
      )
      .icon(
        "redeem_light",
        "./assets/icons/material/ic_redeem_white_48px.svg",
        48
      )
      .icon(
        "redeem_dark",
        "./assets/icons/material/ic_redeem_black_48px.svg",
        48
      )
      .icon("star_light", "./assets/icons/material/ic_star_white_48px.svg", 48)
      .icon("star_dark", "./assets/icons/material/ic_star_black_48px.svg", 48)
      .icon(
        "star_border_light",
        "./assets/icons/material/ic_star_border_white_48px.svg",
        48
      )
      .icon(
        "star_border_dark",
        "./assets/icons/material/ic_star_border_black_48px.svg",
        48
      )
      .icon(
        "move_horizontal_light",
        "./assets/icons/material/ic_swap_horiz_white_48px.svg",
        48
      )
      .icon(
        "move_horizontal_dark",
        "./assets/icons/material/ic_swap_horiz_black_48px.svg",
        48
      )
      .icon(
        "expand_more_light",
        "./assets/icons/material/ic_expand_more_white_48px.svg",
        48
      )
      .icon(
        "expand_more_dark",
        "./assets/icons/material/ic_expand_more_black_48px.svg",
        48
      )
      .icon(
        "pie_light",
        "./assets/icons/material/ic_pie_chart_white_48px.svg",
        48
      )
      .icon(
        "pie_dark",
        "./assets/icons/material/ic_pie_chart_black_48px.svg",
        48
      )
      .icon(
        "trending_up_light",
        "./assets/icons/material/ic_trending_up_white_48px.svg",
        48
      )
      .icon(
        "trending_up_dark",
        "./assets/icons/material/ic_trending_up_black_48px.svg",
        48
      )
      .icon(
        "trending_down_light",
        "./assets/icons/material/ic_trending_down_white_48px.svg",
        48
      )
      .icon(
        "trending_down_dark",
        "./assets/icons/material/ic_trending_down_black_48px.svg",
        48
      )
      .icon(
        "trending_flat_light",
        "./assets/icons/material/ic_trending_flat_white_48px.svg",
        48
      )
      .icon(
        "trending_flat_dark",
        "./assets/icons/material/ic_trending_flat_black_48px.svg",
        48
      )
      .icon(
        "history_light",
        "./assets/icons/material/ic_history_white_48px.svg",
        48
      )
      .icon(
        "history_dark",
        "./assets/icons/material/ic_history_black_48px.svg",
        48
      )
      .icon(
        "comment_light",
        "./assets/icons/material/ic_comment_white_48px.svg",
        48
      )
      .icon(
        "comment_dark",
        "./assets/icons/material/ic_comment_black_48px.svg",
        48
      )
      .icon(
        "attachment_light",
        "./assets/icons/material/ic_attach_file_white_48px.svg",
        48
      )
      .icon(
        "attachment_dark",
        "./assets/icons/material/ic_attach_file_black_48px.svg",
        48
      )
      .icon(
        "event_light",
        "./assets/icons/material/ic_event_white_48px.svg",
        48
      )
      .icon("event_dark", "./assets/icons/material/ic_event_black_48px.svg", 48)
      .icon(
        "date_range_light",
        "./assets/icons/material/ic_date_range_white_48px.svg",
        48
      )
      .icon(
        "date_range_dark",
        "./assets/icons/material/ic_date_range_black_48px.svg",
        48
      )

      // CMD icons @ https://www.dropbox.com/sh/n70kz7yya6yjv1o/AAA8h2z88jer3-1KvSsVTma2a/Iconen?dl=0
      .icon("cmd_enter", "./assets/icons/cmd/enter.svg", 48)
      .icon("cmd_unicorn", "./assets/icons/cmd/unicorn.svg", 48)
      .icon("cmd_book", "./assets/icons/cmd/book.svg", 48); // End icon provier

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
      default: "retro"
    };

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Loading bar provier
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    // How many miliseconds before showing the loading bar
    cfpLoadingBarProvider.latencyThreshold = 50;
    cfpLoadingBarProvider.includeSpinner = false;

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Trello
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    TrelloApiProvider.init({
      key: TRELLO_KEY,
      secret: TRELLO_SECRET,
      expiration: "never",
      scope: { read: true, write: false, account: true },
      name: "CMD Athena"
    });

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Toastr
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    angular.extend(toastrConfig, {
      autoDismiss: false,
      containerId: "toast-container",
      maxOpened: 0,
      extendedTimeOut: 3000,
      newestOnTop: true,
      progressBar: false,
      positionClass: "toast-bottom-right",
      preventDuplicates: false,
      preventOpenDuplicates: false,
      target: "body"
    });

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Moment
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    moment.defineLocale("nl", {
      months: "januari_februari_maart_april_mei_juni_juli_augustus_september_oktober_november_december".split(
        "_"
      ),
      monthsShort: function(m, format) {
        if (/-MMM-/.test(format)) {
          return "jan_feb_mrt_apr_mei_jun_jul_aug_sep_okt_nov_dec".split("_")[
            m.month()
          ];
        } else {
          return "jan_feb_mrt_apr_mei_jun_jul_aug_sep_okt_nov_dec".split("_")[
            m.month()
          ];
        }
      },

      monthsRegex: /^(januari|februari|maart|april|mei|april|ju[nl]i|augustus|september|oktober|november|december|jan\.?|feb\.?|mrt\.?|apr\.?|ju[nl]\.?|aug\.?|sep\.?|okt\.?|nov\.?|dec\.?)/i,
      monthsShortRegex: /^(januari|februari|maart|april|mei|april|ju[nl]i|augustus|september|oktober|november|december|jan\.?|feb\.?|mrt\.?|apr\.?|ju[nl]\.?|aug\.?|sep\.?|okt\.?|nov\.?|dec\.?)/i,
      monthsStrictRegex: /^(januari|februari|maart|mei|ju[nl]i|april|augustus|september|oktober|november|december)/i,
      monthsShortStrictRegex: /^(jan\.?|feb\.?|mrt\.?|apr\.?|mei|ju[nl]\.?|aug\.?|sep\.?|okt\.?|nov\.?|dec\.?)/i,

      monthsParse: [
        /^jan/i,
        /^feb/i,
        /^maart|mrt.?$/i,
        /^apr/i,
        /^mei$/i,
        /^jun[i.]?$/i,
        /^jul[i.]?$/i,
        /^aug/i,
        /^sep/i,
        /^okt/i,
        /^nov/i,
        /^dec/i
      ],
      longMonthsParse: [
        /^jan/i,
        /^feb/i,
        /^maart|mrt.?$/i,
        /^apr/i,
        /^mei$/i,
        /^jun[i.]?$/i,
        /^jul[i.]?$/i,
        /^aug/i,
        /^sep/i,
        /^okt/i,
        /^nov/i,
        /^dec/i
      ],
      shortMonthsParse: [
        /^jan/i,
        /^feb/i,
        /^maart|mrt.?$/i,
        /^apr/i,
        /^mei$/i,
        /^jun[i.]?$/i,
        /^jul[i.]?$/i,
        /^aug/i,
        /^sep/i,
        /^okt/i,
        /^nov/i,
        /^dec/i
      ],

      weekdays: "zondag_maandag_dinsdag_woensdag_donderdag_vrijdag_zaterdag".split(
        "_"
      ),
      weekdaysShort: "zo._ma._di._wo._do._vr._za.".split("_"),
      weekdaysMin: "Zo_Ma_Di_Wo_Do_Vr_Za".split("_"),
      weekdaysParseExact: true,
      longDateFormat: {
        LT: "HH:mm",
        LTS: "HH:mm:ss",
        L: "DD-MM-YYYY",
        LL: "D MMMM YYYY",
        LLL: "D MMMM YYYY HH:mm",
        LLLL: "dddd D MMMM YYYY HH:mm"
      },
      calendar: {
        sameDay: "[vandaag om] LT",
        nextDay: "[morgen om] LT",
        nextWeek: "dddd [om] LT",
        lastDay: "[gisteren om] LT",
        lastWeek: "[afgelopen] dddd [om] LT",
        sameElse: "L"
      },
      relativeTime: {
        future: "over %s",
        past: "%s geleden",
        s: "een paar seconden",
        m: "één minuut",
        mm: "%d minuten",
        h: "één uur",
        hh: "%d uur",
        d: "één dag",
        dd: "%d dagen",
        M: "één maand",
        MM: "%d maanden",
        y: "één jaar",
        yy: "%d jaar"
      },
      ordinalParse: /\d{1,2}(ste|de)/,
      ordinal: function(number) {
        return (
          number + (number === 1 || number === 8 || number >= 20 ? "ste" : "de")
        );
      },
      week: {
        dow: 1, // Monday is the first day of the week.
        doy: 4 // The week that contains Jan 4th is the first week of the year.
      }
    });
    moment.locale("nl");
    moment.tz.setDefault("Etc/Greenwich");

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Translations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    $translateProvider
      .translations("nl-NL", {
        ACCOUNTABILITY: "Verantwoording",
        ADD: "Toevoegen",
        AGREEMENT: "Afspraak",
        AGREEMENTS: "Afspraken",
        ALL: "Alles",
        AMOUNT: "Aantal",
        AMOUNT_OF_CARDS: "Aantal kaarten",
        ATTITUDE: "Houding",
        AVERAGE: "Gemiddelde",
        BEYOND_WILL_LAST: "Beyond duurt nog",
        CARD: "Kaart",
        CHANGE: "Wijzig",
        CHANGE_NAME: "Wijzig naam",
        CLASS: "Klas",
        CLOSE: "Sluiten",
        COMPARED_TO_PREVIOUS_WEEK: "T.o.v. afgelopen week",
        COMPLETED: "Voltooid",
        COMPLETED_CARDS: "Voltooide kaarten",
        CONFIRM: "Bevestig",
        COORDINATOR: "Coordinator",
        COORDINATOR_ADD_CLASS_TEXT: "Voeg een klas toe om te beginnen",
        COORDINATOR_DASHBOARD_IS_COORDINATOR: "Is coordinator",
        COORDINATOR_NO_TEACHER_IN_CLASS:
          "Er zitten (nog) geen docenten in deze klas",
        COORDINATOR_REMOVE_TEACHER: "Verwijder docent van",
        DAY: "Dag",
        DEADLINE: "Deadline",
        DESELECT: "De-selecteer",
        DOES_NOT_EXIST: "Bestaad niet",
        DONE_LIST: "Done lijst",
        DONE_LIST_TEXT: "`Welke lijst is de `done` lijst",
        DURATION: "Duur",
        EXPIRES: "Vervalt",
        FEEDBACK: "Feedback",
        FIND: "Zoek",
        FIND_AGREEMENT: "Zoek afspraak",
        FIND_BY_FUNCTION: "Zoek op functie",
        FIND_BY_NAME: "Zoek op naam",
        FOCUS: "Focus",
        FORGOT_PASSWORD: "Wachtwoord vergeten",
        FUNCTIONING_IN_TEAM: "Functioneren binnen het team",
        IMPORTANT: "Belangrijk",
        IS_NO_COORDINATOR: "Is NO coordinator",
        JS_ADDED: "Toegevoegd",
        JS_ADDED_TO: "Toegevoegd aan",
        JS_ADD_CLASS: "Klas toeveogen",
        JS_ADD_TEACHER_TO: "Toevoegen docent aan",
        JS_AGREEMENT: "Afspraak",
        JS_AGREEMENTS: "Afspraken",
        JS_AGREEMENT_REMOVED: "Afspraak verwijdert",
        JS_ALLREADY_WAS_A_TEACHER_OF: "was al een docent van",
        JS_ARE_YOU_SURE_DELETE_RULE:
          "Weet je zeker dat je deze afspraak wilt verwijderen?",
        JS_ARE_YOU_SURE_DELETE_TEAM:
          "Weet je zeker dat je dit team wilt verwidjeren?",
        JS_AUTHENTICATED_FAILED: "Authenticatie gefaalt",
        JS_AUTHENTICATED_SUCCEEDED: "Authenticatie success",
        JS_CAN_NOT_BE_UNDONE: "Deze actie kan niet ongedaan worden.",
        JS_CHANGED: "Aangepast",
        JS_CHANGE_RULE: "Wijzig afpsraak",
        JS_CLASS: "Klas",
        JS_CLASSES: "Klassen",
        JS_CLASSES_OVERVIEW: "Klassen overzicht",
        JS_CLASS_SETTINGS: "Klas instellingen",
        JS_ENTER_NAME: "Vul een naam in",
        JS_FILL_IN_ALL_FIELDS:
          "Vul alle velden in om een afpsraak toe te voegen",
        JS_IS_REMOVED_FROM: "Is verwijdert van",
        JS_LECTURER: "Docent",
        JS_NAME: "Naam",
        JS_NAME_CHANGED_TO: "Naam gewijzigt naar",
        JS_NAME_NEW_CLASS: "Naam nieuwe klas",
        JS_NAME_OF_CLASS: "Wat is de naam",
        JS_NEW_CLASS: "Nieuwe klas",
        JS_PROBLEM_DATABASE_CONNECTION:
          "Er lijkt iets mis te gaan met de verbinding tot de database",
        JS_REMOVE_AGREEMENT: "Verwijder afpsraak",
        JS_REMOVE_TEAM: "Verwijder team",
        JS_SELECT_TEACHERS: "Selecteerd docenten",
        JS_SETTING_SAVED: "Instelling opgeslagen",
        JS_STUDENT: "Student",
        JS_STUDENTS: "Studenten",
        JS_VERIFY_TRELLO_ACCOUNT:
          "Verifieer trello account om door te kunnen gaan",
        JS_WORKLOAD: "Workload",
        KNOWLEDGE_DEVELOPMENT: "Kennisontwikkeling",
        LANGUAGE: "Taal",
        LESS_IMPORTANT: "Minder belangrijk",
        LOADING_PAGE: "Pagina laden",
        LOGIN: "Inloggen",
        LOGOUT: "Uitloggen",
        MADE_AT: "Gemaakt op",
        MEMBER: "Groepslid",
        MEMBERS: "Groepsleden",
        MY_CARDS: "Mijn kaarten",
        MY_FEEDBACK: "Mijn feedback",
        NEW: "Nieuwe",
        NEW_AGREEMENT: "Nieuwe afspraak",
        NEW_STUDENTS: "Nieuwe student(en)",
        NEW_TEAM: "Nieuw team",
        NOT_ENOUGH_DATA: "Niet genoeg data",
        NOT_FOUND: "Niet gevonden",
        NO_CLASS_FOUND: "Klas niet ingesteld",
        NO_OVERDUE_CARDS: "Geen achterstallige kaarten",
        NO_MEMBERS: "Dit team heeft (nog) geen leden",
        NO_TEAM_FOUND: "Geen team gevonden",
        NO_TEAM_FOUND_TEXT:
          "Voeg een nieuw team toe door op het schild te klikken",
        NO_TRELLO_USER: "Geen trello gebruiker ingesteld",
        OPTIONS: "Opties",
        OVERDUE_CARDS: "Achterstallige kaarten",
        PASSWORD: "Wachtwoord",
        PERIOD: "Periode",
        PER_MEMBER_PER_WEEK: "Per lid per week",
        PER_MEMBER_TOTAL: "Per lid totaal",
        PLURAL_1: "en",
        PLURAL_2: "s",
        POINT_PERCENTAGE: "Punten in percentage",
        PROFILE: "Profiel",
        PROFILE_ASK_FOR_CONFIRMATION: "Vraag om bevestiging",
        PROFILE_ASK_FOR_CONFIRMATION_EXPLANATION:
          "Gebruik deze optie om te voorkomen dat je perongeluk essentiele data verwijderd.",
        PROFILE_GENERAL_INFORMATION: "Algemene informatie",
        PROFILE_MEMBER_SINCE: "lid sinds",
        PROFILE_USE_HOTKEYS:
          "Gebruik hotkeys voor snelle navigatie door het platform.",
        PROGRESS: "Progressie",
        REMEMBER_ME: "Onthoud mij",
        REMOVE: "Verwijder",
        REMOVED: "Verwijdert",
        REMOVE_CLASS: "Verwijder klas",
        RULE: "Afspraak",
        RULES: "Afspraken",
        SECONDS: "Seconden",
        SELECTED: "Geselecteerde",
        SETTINGS: "Instellingen",
        STARTING_DATE: "Start datum",
        STUDENT: "Student",
        STUDENT_DASHBOARD_ALL_CARDS_COMPLETED: "Al jouw kaarten zijn voltooid",
        STUDENT_DASHBOARD_DAYS_TO_GIVE_FEEDBACK:
          "dagen om feedback te geven of te wijzigen",
        STUDENT_DASHBOARD_HOURS_TO_GIVE_FEEDBACK:
          "uur om feedback te geven of te wijzigen",
        STUDENT_DASHBOARD_OTHER_CARDS: "andere kaarten",
        STUDENT_DASHBOARD_TO_COMPLETE: "nog te voltooien",
        STUDENT_DASHBOARD_UNFINISHED_CARD: "Onvoltooide kaart",
        STUDENT_DASHBOARD_WITH_DEADLINE: "met deadline deze week",
        STUDENT_JSON: "Student(en) JSON data",
        STUDENT_NUMBER: "Studentnummer",
        STUDENT_RULES_ADD: "Opstellen",
        STUDENT_RULES_ADD_AGREEMENT: "Afspraak toevoegen",
        STUDENT_RULES_ADD_AGREEMENT_HELP: "Max één eigen regel per team",
        STUDENT_RULES_ADD_AGREEMENT_HELP_2:
          "De nieuwe afspraak word automatisch geselecteerd voor het samenwerkingscontract.",
        STUDENT_RULES_AGREEMENTS_EXPLANATION:
          "Kies tenminste acht afspraken met uit elke categorie tenminste één afspraak. Ook kun je als team één eigen afspraak opstellen.",
        STUDENT_RULES_AGREEMENTS_WARNING:
          "elke week zal iedereen elkaar beoordelen op de gemaakte afspraken.",
        STUDENT_RULES_CANT_EDIT: "Je kunt deze week niet meer bewerken",
        STUDENT_RULES_CHOOSE_ATLEAST: "Kies nog minimaal",
        STUDENT_RULES_CHOOSE_ATLEAST_ONE:
          "Kies uit elke categorie tenminste één afspraak",
        STUDENT_RULES_CONFIRM_CANT_EDIT:
          "Afspraken kunnen NIET meer veranderd worden nadat deze geaccepteerd zijn.",
        STUDENT_RULES_CONFIRM_CHECK_AGREEMENTS: "Controleer afspraken",
        STUDENT_RULES_CONFIRM_CHOSEN_AGREEMENTS: "Gekozen afspraken",
        STUDENT_RULES_CONFIRM_EXPLANATION:
          "Zorg ervoor dat elk lid van je team akkoord gaat met de afspraken voordat je deze accepteert.",
        STUDENT_RULES_COOPERATION_CONTRACT: "Samenwerkingscontract",
        STUDENT_RULES_COOPERATION_CONTRACT_EXPLANATION:
          "Om de samenwerking zo eerlijk mogenlijk te laten verlopen vragen wij elke project team afspraken op te stellen. Hieronder zie je een lijst met afspraken waarvan wij denken waaraan gehouden zou kunnen worden. Deze afspraken zijn onderverdeeld in vier categorieën:",
        STUDENT_RULES_OWN_AGREEMENT: "Eigen afspraak",
        STUDENT_RULES_REMOVE: "Verwijder afspraak",
        STUDENT_RULES_VIEW_CONTRACT: "Bekijk samenwerkingscontract",
        STUDENT_WORKLOAD_AMOUNT_OF_CARDS: "Aantal kaarten",
        STUDENT_WORKLOAD_COMLETED_AMOUNT: "Waarvan voltooid",
        STUDENT_WORKLOAD_ONLY: "Nog maar",
        STUDENT_WORKLOAD_SHOW_COMPELTED_CARDS_OF:
          "Bekijk voltooide kaarten van",
        STUDENT_WORKLOAD_TO_BE_PRECISE: "uur om precies te zijn",
        TEACHER: "Docent",
        TEACHERS: "Docenten",
        TEAM: "Team",
        TEAMS: "Teams",
        TEAM_NOT_CONFIGURED: "Zorg dat de klas is ingesteld",
        TEXT_PASSWORD_PROTECT: "Vul wachtwoord in",
        TEXT_PASSWORD_PROTECT_2:
          "Deze melding niet meer ontvangen? Stel dit in op je profiel.",
        THE_STUDENT: "De student",
        TILL_END_OF_WEEK: "Tot einde week",
        TOOLBAR_NO_CLASSES_FOUND: "Geen klas(sen) gevonden",
        TOOLBAR_NO_GROUPS_FOUND: "Geen group(en) gevonden",
        TOOLBAR_TAKE_ME_BACK: "Terug",
        TOTAL: "Totaal",
        TO_GO_THIS_WEEK: "te gaan deze week",
        TRELLO_BOARD: "Trello bord",
        TRELLO_BOARD_EXPIRED: "Trello board bestaad niet meer",
        TRELLO_GOTO: "Naar trello",
        TRELLO_NOT_CONFIGURED: "Trello niet ingesteld",
        TRELLO_USER: "Trello gebruiker",
        TRELLO_USER_ID_TEXT: "ID van trello gebruiker",
        UNCOMPLETED_CARDS: "Onvoltooide kaarten",
        USE_HOTKEYS: "Gebruik hotkeys",
        VERY_IMPORTANT: "Zeer belanrijk",
        VIEW_FEEDBACK: "Bekijk feedback",
        VIEW_ON: "Bekijk op",
        VIEW_ON_TRELLO: "Bekijk op trello",
        VIEW_PROGRESS: "Bekijk progressie",
        WAIT_FOR_CLASS: "Wacht tot een coordinator deze klas goed insteld",
        WAIT_FOR_CLASS_LECTURER:
          "Voeg een nieuwe klas toe op de settings pagina",
        WAIT_FOR_TEAM: "Wacht totdat een docent je toevoegd aan een team",
        WAIT_FOR_TEAM_LECTURER:
          "Wacht tot een coordinator je toevoegd aan een team",
        WAIT_FOR_TRELLO: "Wacht totdat een docent trello insteld voor dit team",
        WARNING: "Let op",
        WEEK: "Week",
        WEEKS: "Weken",
        WHAT_IS_THE_IMPORTANCE: "Hoe belangrijk is deze afspraak",
        WHAT_IS_THE_IMPORTANCE_TEXT:
          "Hoe belangrijker de afspraak, hoe meer punten te verdienen"
      })
      .translations("en-EN", {
        ACCOUNTABILITY: "Accountability",
        ADD: "Add",
        AGREEMENT: "Agreement",
        AGREEMENTS: "Agreements",
        ALL: "All",
        AMOUNT: "Amount",
        AMOUNT_OF_CARDS: "Amount of cards",
        ATTITUDE: "Attitude",
        AVERAGE: "Average",
        BEYOND_WILL_LAST: "Beyond will last",
        CARD: "Card",
        CHANGE: "Change",
        CHANGE_NAME: "Change name",
        CLASS: "Class",
        CLOSE: "Close",
        COMPARED_TO_PREVIOUS_WEEK: "Compared to previous week",
        COMPLETED: "Completed",
        COMPLETED_CARDS: "Completed cards",
        CONFIRM: "Confirm",
        COORDINATOR: "Coordinator",
        COORDINATOR_ADD_CLASS_TEXT: "Add a new class to get started",
        COORDINATOR_DASHBOARD_IS_COORDINATOR: "Is coordinator",
        COORDINATOR_NO_TEACHER_IN_CLASS:
          "There are no teachers in this class (yet)",
        COORDINATOR_REMOVE_TEACHER: "Remove teachter from",
        DAY: "Day",
        DEADLINE: "Deadline",
        DESELECT: "De-selected",
        DOES_NOT_EXIST: "Does not exist",
        DONE_LIST: "Done list",
        DONE_LIST_TEXT: "Which list is the `done` list",
        DURATION: "Duration",
        EXPIRES: "Expires",
        FEEDBACK: "Feedback",
        FIND: "Find",
        FIND_AGREEMENT: "Find agreement",
        FIND_BY_FUNCTION: "Find by function",
        FIND_BY_NAME: "Find by name",
        FOCUS: "Focus",
        FORGOT_PASSWORD: "Forgot password",
        FUNCTIONING_IN_TEAM: "Functioning within the team",
        IMPORTANT: "Important",
        IS_NO_COORDINATOR: "Is NO coordinator",
        JS_ADDED: "Added",
        JS_ADDED_TO: "Added to",
        JS_ADD_CLASS: "Add new class",
        JS_ADD_TEACHER_TO: "Add teacher to",
        JS_AGREEMENT: "Agreement",
        JS_AGREEMENTS: "Agreements",
        JS_AGREEMENT_REMOVED: "Agreement removed",
        JS_ALLREADY_WAS_A_TEACHER_OF: "allready was a teacher of",
        JS_ARE_YOU_SURE_DELETE_RULE:
          "Are you sure you want to remove this agreement?",
        JS_ARE_YOU_SURE_DELETE_TEAM:
          "Are you sure you want to remove this team?",
        JS_AUTHENTICATED_FAILED: "Authentication failed",
        JS_AUTHENTICATED_SUCCEEDED: "Authentication succeeded",
        JS_CAN_NOT_BE_UNDONE: "This action can not be undone.",
        JS_CHANGED: "Changed",
        JS_CHANGE_RULE: "Change rule",
        JS_CLASS: "Class",
        JS_CLASSES: "Classes",
        JS_CLASSES_OVERVIEW: "Classes overview",
        JS_CLASS_SETTINGS: "Class settings",
        JS_ENTER_NAME: "Enter a name",
        JS_FILL_IN_ALL_FIELDS: "Fill in all fields to add agreement",
        JS_IS_REMOVED_FROM: "Is removed from",
        JS_LECTURER: "Lecturer",
        JS_NAME: "Name",
        JS_NAME_CHANGED_TO: "Name changed to",
        JS_NAME_NEW_CLASS: "Name new class",
        JS_NAME_OF_CLASS: "What is the name going to be",
        JS_NEW_CLASS: "New class",
        JS_PROBLEM_DATABASE_CONNECTION:
          "There seems to be a problem establishing a database connection",
        JS_REMOVE_AGREEMENT: "Remove agreement",
        JS_REMOVE_TEAM: "Remove team",
        JS_SELECT_TEACHERS: "Select teachers",
        JS_SETTING_SAVED: "Setting saved",
        JS_STUDENT: "Student",
        JS_STUDENTS: "Students",
        JS_VERIFY_TRELLO_ACCOUNT: "Verify trello account to continue.",
        JS_WORKLOAD: "Workload",
        KNOWLEDGE_DEVELOPMENT: "Knowledge development",
        LANGUAGE: "Language",
        LESS_IMPORTANT: "Less important",
        LOADING_PAGE: "Loading page",
        LOGIN: "Login",
        LOGOUT: "Logout",
        MADE_AT: "Made at",
        MEMBER: "Member",
        MEMBERS: "Members",
        MY_CARDS: "My cards",
        MY_FEEDBACK: "My feedback",
        NEW: "New",
        NEW_AGREEMENT: "New agreement",
        NEW_STUDENTS: "New student(s)",
        NEW_TEAM: "New team",
        NOT_ENOUGH_DATA: "Not enough data",
        NOT_FOUND: "Not found",
        NO_CLASS_FOUND: "Class not set",
        NO_OVERDUE_CARDS: "No overdue cards",
        NO_MEMBERS: "This team has no members (yet)",
        NO_TEAM_FOUND: "No team found",
        NO_TEAM_FOUND_TEXT: "Add a new team by clicking the shield",
        NO_TRELLO_USER: "No trello user set",
        OPTIONS: "Options",
        OVERDUE_CARDS: "Overdue cards",
        PASSWORD: "Password",
        PERIOD: "Period",
        PER_MEMBER_PER_WEEK: "Per member per week",
        PER_MEMBER_TOTAL: "Per memeber total",
        PLURAL_1: "s",
        PLURAL_2: "",
        POINT_PERCENTAGE: "Points in percentage",
        PROFILE: "Profile",
        PROFILE_ASK_FOR_CONFIRMATION: "Ask for comfirmation",
        PROFILE_ASK_FOR_CONFIRMATION_EXPLANATION:
          "Use this option to prevent deletion of critical information.",
        PROFILE_GENERAL_INFORMATION: "General information",
        PROFILE_MEMBER_SINCE: "Member since",
        PROFILE_USE_HOTKEYS: "Use hotkeys for faster navigation.",
        PROGRESS: "Progress",
        REMEMBER_ME: "Remember me",
        REMOVE: "Remove",
        REMOVED: "Removed",
        REMOVE_CLASS: "Remove class",
        RULE: "Agreement",
        RULES: "Agreements",
        SECONDS: "Seconds",
        SELECTED: "Selected",
        SETTINGS: "Settings",
        STARTING_DATE: "Starting date",
        STUDENT: "Student",
        STUDENT_DASHBOARD_ALL_CARDS_COMPLETED: "All your cards are completed",
        STUDENT_DASHBOARD_DAYS_TO_GIVE_FEEDBACK: "days to give/change feedback",
        STUDENT_DASHBOARD_HOURS_TO_GIVE_FEEDBACK:
          "hours to give/change feedback",
        STUDENT_DASHBOARD_OTHER_CARDS: "other cards",
        STUDENT_DASHBOARD_TO_COMPLETE: "to complete",
        STUDENT_DASHBOARD_UNFINISHED_CARD: "Unfinished card",
        STUDENT_DASHBOARD_WITH_DEADLINE: "with deadline this week",
        STUDENT_JSON: "Student(s) JSON data",
        STUDENT_NUMBER: "Studentnumber",
        STUDENT_RULES_ADD: "Draw up",
        STUDENT_RULES_ADD_AGREEMENT: "Add agreement",
        STUDENT_RULES_ADD_AGREEMENT_HELP: "Max one agreement per team",
        STUDENT_RULES_ADD_AGREEMENT_HELP_2:
          "The new appointment is automatically selected for the collaboration contract.",
        STUDENT_RULES_AGREEMENTS_EXPLANATION:
          "Choose at least eight appointments with at least one appointment from each category. As a team you can also set up one appointment.",
        STUDENT_RULES_AGREEMENTS_WARNING:
          "Every week everyone will judge each other on the agreements made.",
        STUDENT_RULES_CANT_EDIT: "You can not edit this weak anymore",
        STUDENT_RULES_CHOOSE_ATLEAST: "Choose at least",
        STUDENT_RULES_CHOOSE_ATLEAST_ONE:
          "Choose at least one appointment from each category",
        STUDENT_RULES_CONFIRM_CANT_EDIT:
          "Appointments can NOT be changed after they have been accepted.",
        STUDENT_RULES_CONFIRM_CHECK_AGREEMENTS: "Check agreements",
        STUDENT_RULES_CONFIRM_CHOSEN_AGREEMENTS: "Chosen agreements",
        STUDENT_RULES_CONFIRM_EXPLANATION:
          "Make sure that each member of your team agrees with the agreements before you accept them.",
        STUDENT_RULES_COOPERATION_CONTRACT: "Collaboration contract",
        STUDENT_RULES_COOPERATION_CONTRACT_EXPLANATION:
          "To ensure that the cooperation runs as fairly as possible, we ask each project team to draw up agreements. Below you see a list of agreements that we think could be held. These agreements are divided into four categories",
        STUDENT_RULES_OWN_AGREEMENT: "Own agreement",
        STUDENT_RULES_REMOVE: "Remove agreement",
        STUDENT_RULES_VIEW_CONTRACT: "View collaboration contract",
        STUDENT_WORKLOAD_AMOUNT_OF_CARDS: "Amount of cards",
        STUDENT_WORKLOAD_COMLETED_AMOUNT: "Of which completed",
        STUDENT_WORKLOAD_ONLY: "Only",
        STUDENT_WORKLOAD_SHOW_COMPELTED_CARDS_OF: "View completed cards from",
        STUDENT_WORKLOAD_TO_BE_PRECISE: "hour to be precise",
        TEACHER: "Teacher",
        TEACHERS: "Teachers",
        TEAM: "Team",
        TEAMS: "Teams",
        TEAM_NOT_CONFIGURED: "Make sure this class is configured",
        TEXT_PASSWORD_PROTECT: "Enter password",
        TEXT_PASSWORD_PROTECT_2:
          "No more notifications? Configure on your profile.",
        THE_STUDENT: "The student",
        TILL_END_OF_WEEK: "Till end of week",
        TOOLBAR_NO_CLASSES_FOUND: "No Class(es) found",
        TOOLBAR_NO_GROUPS_FOUND: "No group(s) found",
        TOOLBAR_TAKE_ME_BACK: "Back",
        TOTAL: "Total",
        TO_GO_THIS_WEEK: "to go this week",
        TRELLO_BOARD: "Trello board",
        TRELLO_BOARD_EXPIRED: "Trello board does not exist anymore",
        TRELLO_GOTO: "Goto trello",
        TRELLO_NOT_CONFIGURED: "Trello not configured",
        TRELLO_USER: "Trello user",
        TRELLO_USER_ID_TEXT: "ID of trello user",
        UNCOMPLETED_CARDS: "Uncompleted cards",
        USE_HOTKEYS: "Use kotkeys",
        VERY_IMPORTANT: "Very imporant",
        VIEW_FEEDBACK: "View feedback",
        VIEW_ON: "View on",
        VIEW_ON_TRELLO: "View on trello",
        VIEW_PROGRESS: "View progress",
        WAIT_FOR_CLASS: "Wait for a coordinator to set class",
        WAIT_FOR_CLASS_LECTURER: "Add a new class in the settings page",
        WAIT_FOR_TEAM: "Wait until a teacher joins you on a team",
        WAIT_FOR_TEAM_LECTURER: "Wait for a coordinator to add you to a team",
        WAIT_FOR_TRELLO: "Wait until a teacher sets up trello for this team",
        WARNING: "Warning",
        WEEK: "Week",
        WEEKS: "Weeks",
        WHAT_IS_THE_IMPORTANCE: "What is the importance of this agreement",
        WHAT_IS_THE_IMPORTANCE_TEXT:
          "The imporancy of the rule affects the point you can earn"
      })
      .preferredLanguage("nl-NL");
    // .preferredLanguage('en-EN');
  }
})();
