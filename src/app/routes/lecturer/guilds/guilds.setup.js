(function () {
    'use strict';

    angular
        .module('cmd.guilds', ['ui.router'])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {

        $stateProvider

            .state('base.guilds', {
                url: '/groups',
                abstract: true
            })

            .state('base.guilds.overview', {
                url: '/overview',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/lecturer/guilds/overview/overview.html',
                        controller: 'GuildsOverviewController',
                        controllerAs: 'guildsOverviewCtrl'
                    }
                }
            })

            .state('base.guilds.settings', {
                url: '/:guildUuid/settings',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/lecturer/guilds/settings/settings.html',
                        controller: 'GuildSettingsController',
                        controllerAs: 'guildSettingsCtrl'
                    }
                }
            })

            .state('base.guilds.detail', {
                url: '/:guildUuid/detail',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/lecturer/guilds/detail/detail.html',
                        controller: 'GuildDetailController',
                        controllerAs: 'guildDetailCtrl'
                    }
                }
            })

        ; // End of states

    }
})();
