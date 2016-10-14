(function () {
    'use strict';

    angular
        .module('cmd.components')
        .controller('Toolbarcontroller', Toolbarcontroller);

    /** @ngInject */
    function Toolbarcontroller(
        $state,
        $rootScope,
        $mdSidenav,
        Global
    ) {

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.toggleNavigation = toggleNavigation;
        self.changeState = changeState;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.access = Global.getAccess();
        self.route_title = '';
        self.route_subtitle = '';
        self.back_route = null;
        self.back_route_params = null;

        $rootScope.$on('user-changed', function() {
            self.user = Global.getUser();
            self.access = Global.getAccess();
        });

        $rootScope.$on('route-title', function(event, title, subtitle) {
            self.route_title = title;
            self.route_subtitle = subtitle;
        });

        $rootScope.$on('back-route', function(event, route, params) {
            self.back_route = route;
            self.back_route_params = params;
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function toggleNavigation() {
            // Opens and closes navigation
            $mdSidenav('main__navigation').toggle();
        }

        function changeState() {
            var route = self.back_route;
            $state.go(self.back_route, self.back_route_params);
        }

    }

}());
