(function () {
    'use strict';

    angular
        .module('cmd.components')
        .controller('NavigationController', NavigationController);

    /** @ngInject */
    function NavigationController($rootScope, $mdSidenav, $state) {

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.toggleNavigation = toggleNavigation;
        self.logOut = logOut;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = $rootScope.Global.data.user;
        self.access = self.user.access;

        $rootScope.$on('user-changed', function() {
            self.user = $rootScope.Global.data.user;
            self.access = self.user.access;
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function toggleNavigation() {
            // Opens and closes navigation
            $mdSidenav('main__navigation').toggle();
        }

        function logOut() {
            $rootScope.Global.data.user.data = {};
            $rootScope.Global.data.user.access = 0;
            $rootScope.$broadcast('user-changed');

            // TODO
            // Stop the side navigation from opening in the first place
            $mdSidenav('main__navigation').toggle();


            $state.go('base.account.login');
        }

    }

}());
