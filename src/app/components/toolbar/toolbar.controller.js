(function () {
    'use strict';

    angular
        .module('cmd.components')
        .controller('Toolbarcontroller', Toolbarcontroller);

    /** @ngInject */
    function Toolbarcontroller(
        $rootScope,
        $mdSidenav,
        Global
    ) {

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.toggleNavigation = toggleNavigation;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.access = Global.getAccess();
        self.route_title = '';

        $rootScope.$on('user-changed', function() {
            self.user = Global.getUser();
            self.access = Global.getAccess();
        });

        $rootScope.$on('route-title', function(event, title) {
            self.route_title = title;
        });


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function toggleNavigation() {
            // Opens and closes navigation
            $mdSidenav('main__navigation').toggle();
        }

    }

}());
