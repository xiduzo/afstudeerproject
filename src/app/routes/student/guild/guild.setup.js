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
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/student/guild/guild.html',
                        controller: 'GuildController',
                        controllerAs: 'guildCtrl'
                    }
                }
            })

        ; // End of states

    }
})();
