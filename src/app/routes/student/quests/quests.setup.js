(function () {
    'use strict';

    angular
        .module('cmd.quests', ['ui.router'])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {

        $stateProvider

            .state('base.quests', {
                url: '/assignments',
                abstract: true
            })

            .state('base.quests.log', {
                url: '/log',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/student/quests/log/log.html',
                        controller: 'QuestsLogController',
                        controllerAs: 'questsLogCtrl'
                    }
                }
            })

        ; // End of states

    }
})();
