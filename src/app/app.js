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
            'ngOnboarding',

            /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    		      Filters
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            'secondsToDateTime',

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
            'cmd.progress',

            // Coordinator
            'cmd.worlds',

            // Research
            'cmd.research',
    ]);

}());
