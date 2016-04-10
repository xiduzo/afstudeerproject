(function () {
    'use strict';

    angular
        .module('cmd', [

            //3rd Parties
            'ngAnimate',
            'toastr',
            'ngCookies',
            'ngSanitize',
            'ui.router',
            'restangular',
            'LocalStorageModule',
            'ngMaterial',

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
    ]);

}());
