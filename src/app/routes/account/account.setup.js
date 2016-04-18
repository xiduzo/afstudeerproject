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

            .state('base.account.login', {
                url: '/login',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/account/login/login.html',
                        controller: 'AccountLoginController',
                        controllerAs: 'accountLoginCtrl'
                    }
                }
            })

            .state('base.account.detail', {
                url: '/detail',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/account/detail/detail.html',
                        controller: 'AccountDetailController',
                        controllerAs: 'accountDetailCtrl'
                    }
                }
            })

            .state('base.account.settings', {
                url: '/settings',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/account/settings/settings.html',
                        controller: 'AccountSettingsController',
                        controllerAs: 'accountSettingsCtrl'
                    }
                }
            })

        ; // End of states

    }
})();
