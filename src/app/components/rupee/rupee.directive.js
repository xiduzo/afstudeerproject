(function () {
    'use strict';

    angular
        .module('cmd.components')
        .directive('cmdRupee', cmdRupee);

    /** @ngInject */
    function cmdRupee() {

        return {
            restrict: 'E',
            templateUrl: 'app/components/rupee/rupee.html',
            controller: 'RupeeController',
            controllerAs: 'rupeeCtrl',
            replace: true,
            bindToController: true,
            scope: {
                type: '@type',
                amount: '@amount',
            }
        };

    }

}());
