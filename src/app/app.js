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
            'cmd.guild',
            'cmd.account',
    ]);

}());
