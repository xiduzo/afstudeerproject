(function () {
    'use strict';

    angular
        .module('cmd.components')
        .directive('cmdNavigation', cmdNavigation);

    /** @ngInject */
    function cmdNavigation() {

        return {
            restrict: 'E',
            templateUrl: 'app/components/navigation/navigation.html',
            controller: 'NavigationController',
            controllerAs: 'navigationCtrl',
            replace: true,
            bindToController: true,
        };

    }

}());
