(function () {
    'use strict';

    angular
        .module('cmd.components')
        .directive('navigation', navigation)
        .controller('NavigationController', NavigationController);

    /** @ngInject */
    function navigation() {

        return {
            restrict: 'E',
            templateUrl: 'app/components/navigation/navigation.html',
            controller: 'NavigationController',
            controllerAs: 'navigationCtrl',
            replace: true,
            bindToController: true,
        };

    }

    /** @ngInject */
    function NavigationController($mdSidenav) {

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.toggleNavigation = toggleNavigation;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function toggleNavigation() {
            console.log(true);
            // Opens and closes navigation
            $mdSidenav('main__navigation').toggle();
        }

    }

}());
