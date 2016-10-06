(function () {
    'use strict';

    angular
        .module('cmd.guild', ['ui.router'])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {

        $stateProvider

            .state('base.guild', {
                url: '/group',
                abstract: true
            })

            .state('base.guild.progress', {
                url: '/progress',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/student/guild/progress/progress.html',
                        controller: 'GuildProgressController',
                        controllerAs: 'guildProgressCtrl'
                    }
                }
            })

            .state('base.guild.activity', {
                url: '/activity',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/student/guild/activity/activity.html',
                        controller: 'GuildActivityController',
                        controllerAs: 'guildActivityCtrl'
                    }
                }
            })

        ; // End of states

    }
})();
