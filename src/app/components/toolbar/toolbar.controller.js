(function () {
    'use strict';

    angular
        .module('cmd.components')
        .controller('Toolbarontroller', Toolbarontroller);

    /** @ngInject */
    function Toolbarontroller($scope, $mdMedia, $rootScope, $mdSidenav) {

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.toggleNavigation = toggleNavigation;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = $rootScope.Global.getUser();
        self.access = $rootScope.Global.getAccess();

        $scope.$watch(function() { return $mdMedia('gt-sm'); }, function(bool) {
            self.index = bool;
        });

        $rootScope.$on('user-changed', function() {
            self.user = $rootScope.Global.getUser();
            self.access = $rootScope.Global.getAccess();
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
