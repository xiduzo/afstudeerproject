(function () {
    'use strict';

    angular
        .module('cmd.base')
        .controller('BaseController', BaseController);

    /** @ngInject */
    function BaseController($mdSidenav, $mdToast) {

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
            // Opens and closes navigation
            $mdSidenav('main__navigation').toggle();
        }

    }

}());
