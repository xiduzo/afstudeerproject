(function () {
    'use strict';

    angular
        .module('cmd.guilds', ['ui.router'])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {

        $stateProvider

            .state('base.guilds', {
                url: '/team',
                abstract: true
            })

            .state('base.guilds.overview', {
                url: '/overzicht',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/lecturer/guilds/overview/overview.html',
                        controller: 'GuildsOverviewController',
                        controllerAs: 'guildsOverviewCtrl'
                    }
                }
            })

            .state('base.guilds.settings', {
                url: '/instellingen/:guildUuid',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/lecturer/guilds/settings/settings.html',
                        controller: 'GuildSettingsController',
                        controllerAs: 'guildSettingsCtrl'
                    }
                }
            })

            .state('base.guilds.progress', {
                url: '/progressie/:guildUuid',
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
