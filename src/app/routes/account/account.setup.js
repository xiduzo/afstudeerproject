(function () {
    'use strict';

    angular
        .module('cmd.account', ['ui.router'])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {

        $stateProvider
            .state('base.account', {
                url: '/account',
                abstract: true
            })

            .state('base.account.detail', {
                url: '/detail',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/account/detail/detail.html',
                        controller: 'AccountDetailController',
                        controllerAs: 'acountDetailCtrl'
                    }
                }
            })

            .state('base.account.settings', {
                url: '/settings',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/account/settings/settings.html',
                        controller: 'AccountSettingsController',
                        controllerAs: 'acountSettingsCtrl'
                    }
                }
            })

        ; // End of states

    }
})();
