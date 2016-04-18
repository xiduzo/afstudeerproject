(function () {
    'use strict';

    angular
        .module('cmd', [

            //3rd Parties
            'ngCookies',
            'ngSanitize',
            'ui.router',
            'restangular',
            'LocalStorageModule',
            'ngMaterial',
            'ngScrollbars',
            'dndLists',

            // Filters
            'secondsToDateTime',

            //Config
            'cmd.config',

            //Constants
            'cmd.constants',

            //modules
            'cmd.base',
            'cmd.services',
            'cmd.components',

            //routes
            'cmd.home',
            'cmd.worlds',
            'cmd.guilds',
            'cmd.progress',
            'cmd.guild',
            'cmd.quests',
            'cmd.account',
    ]);

}());
