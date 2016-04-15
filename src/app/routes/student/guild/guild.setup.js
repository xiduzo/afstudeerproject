(function () {
    'use strict';

    angular
        .module('cmd.guild', ['ui.router'])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {

        $stateProvider

            .state('base.guild', {
                url: '/guild',
                abstract: true
            })

            .state('base.guild.overview', {
                url: '/overview',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/student/guild/overview/overview.html',
                        controller: 'GuildOverviewController',
                        controllerAs: 'guildOverviewCtrl'
                    }
                }
            })

        ; // End of states

    }
})();
