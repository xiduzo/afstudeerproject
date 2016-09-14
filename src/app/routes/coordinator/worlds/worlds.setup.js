(function () {
    'use strict';

    angular
        .module('cmd.worlds', ['ui.router'])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {

        $stateProvider

            .state('base.worlds', {
                url: '/classes',
                abstract: true
            })

            .state('base.worlds.overview', {
                url: '/overview',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/coordinator/worlds/overview/overview.html',
                        controller: 'WorldsOverviewController',
                        controllerAs: 'worldsOverviewCtrl'
                    }
                }
            })

            .state('base.worlds.settings', {
                url: '/:worldUuid/settings',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/coordinator/worlds/settings/settings.html',
                        controller: 'WorldsSettingsController',
                        controllerAs: 'worldsSettingsCtrl'
                    }
                }
            })

            .state('base.worlds.quests', {
                url: '/quests',
                abstract: true
            })

            .state('base.worlds.quests.new', {
                url: '/:worldUuid/new',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/coordinator/worlds/quests/new/new.html',
                        controller: 'WorldsQuestsNewController',
                        controllerAs: 'worldsQuestsNewCtrl'
                    }
                }
            })

            .state('base.worlds.quests.edit', {
                url: '/:worldUuid/edit/:questUuid',
                views: {
                    'main@base': {
                        templateUrl: 'app/routes/coordinator/worlds/quests/edit/edit.html',
                        controller: 'WorldsQuestsEditController',
                        controllerAs: 'worldsQuestsEditCtrl'
                    }
                }
            })

        ; // End of states

    }
})();
