(function () {
    'use strict';

    angular
        .module('cmd', [

            /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    		      3rd parties
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            'ngCookies',
            'ngSanitize',
            'ngAnimate',
            'ui.router',
            'ui.gravatar',
            'LocalStorageModule',
            'ngMaterial',
            'dndLists',
            'angular-loading-bar',
            'cfp.hotkeys',
            'angular-md5',
            'base64',
            'trello',
            'toastr',
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
