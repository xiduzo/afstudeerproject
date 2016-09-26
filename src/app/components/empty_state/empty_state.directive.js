(function () {
    'use strict';

    angular
        .module('cmd.components')
        .directive('cmdEmptyState', cmdEmptyState);

    /** @ngInject */
    function cmdEmptyState() {

        return {
            restrict: 'E',
            templateUrl: 'app/components/empty_state/empty_state.html',
            controller: 'EmptyStateController',
            controllerAs: 'emptyStateCtrl',
            replace: true,
            bindToController: true,
            scope: {
                icon: '@icon',
                tooltip: '@tooltip',
                headline: '@headline',
                title: '@title',
                subtitle: '@subtitle',
            }
        };

    }

}());
