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
                url: '/settings/:guildUuid',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/lecturer/guilds/settings/settings.html',
                        controller: 'GuildSettingsController',
                        controllerAs: 'guildSettingsCtrl'
                    }
                }
            })

            .state('base.guilds.progress', {
                url: '/progress/:guildUuid',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/lecturer/guilds/progress/progress.html',
                        controller: 'GuildDetailProgressController',
                        controllerAs: 'guildDetailProgressCtrl'
                    }
                }
            })

            .state('base.guilds.feedback', {
                url: '/feedback/:guildUuid',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/lecturer/guilds/feedback/feedback.html',
                        controller: 'GuildDetailFeedbackController',
                        controllerAs: 'guildDetailFeedbackCtrl'
                    }
                }
            })

        ; // End of states

    }
})();
