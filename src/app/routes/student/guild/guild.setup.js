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

            .state('base.guild.workload', {
                url: '/workload',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/student/guild/workload/workload.html',
                        controller: 'GuildWorkloadController',
                        controllerAs: 'guildWorkloadCtrl'
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

            .state('base.guild.rules', {
                url: '/feedback',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/student/guild/rules/rules.html',
                        controller: 'GuildRulesController',
                        controllerAs: 'guildRulesCtrl'
                    }
                }
            })

        ; // End of states

    }
})();
