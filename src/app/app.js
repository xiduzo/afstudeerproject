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
            'angular-loading-bar',
            'ngOnboarding',
            'cfp.hotkeys',
            'angular-md5',
            'trello',
            // 'angular-websocket',
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
            'cmd.guild',

            // Lecturer
            'cmd.guilds',

            // Coordinator
            'cmd.worlds',
            'cmd.rules',
            'cmd.lecturers',
            'cmd.students',

            // Research
            'cmd.research',
    ]);

}());
