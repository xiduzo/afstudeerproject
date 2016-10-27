(function () {
    'use strict';

    angular
        .module('cmd', [

            /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    		      3rd parties
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            'ngCookies',
            'ngSanitize',
            'ui.router',
            'ui.gravatar',
            'LocalStorageModule',
            'ngMaterial',
            'ngScrollbars',
            'dndLists',
            'textAngular',
            'angular-loading-bar',
            'ngOnboarding',
            'cfp.hotkeys',
            'angular-md5',
            'trello',
            /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    		      Filters
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            'filters',

            /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    		      Config
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            'cmd.config',

            /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    		      Constants
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            'cmd.constants',

            /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    		      Modules
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            'cmd.base',
            'cmd.services',
            'cmd.components',

            /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    		      Routes
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            // All
            'cmd.home',
            'cmd.account',

            // Student
            'cmd.quests',
            'cmd.guild',

            // Lecturer
            'cmd.guilds',
            'cmd.assessments',
            'cmd.stimulance',

            // Coordinator
            'cmd.worlds',
            'cmd.rules',
            'cmd.behaviour',

            // Research
            'cmd.research',
    ]);

}());
