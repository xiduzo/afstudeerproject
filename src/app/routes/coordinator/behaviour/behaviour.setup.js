(function () {
    'use strict';

    angular
        .module('cmd.behaviour', ['ui.router'])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {

        $stateProvider

            .state('base.behaviour', {
                url: '/behaviour',
                abstract: true
            })

            .state('base.behaviour.behaviours', {
                url: '/behaviours',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/coordinator/behaviour/behaviours/behaviours.html',
                        controller: 'BehavioursController',
                        controllerAs: 'behavioursCtrl'
                    }
                }
            })

            .state('base.behaviour.rewards', {
                url: '/rewards',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/coordinator/behaviour/rewards/rewards.html',
                        controller: 'RewardsController',
                        controllerAs: 'rewardsCtrl'
                    }
                }
            })


        ; // End of states

    }
})();
