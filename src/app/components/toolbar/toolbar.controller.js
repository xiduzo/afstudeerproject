(function () {
    'use strict';

    angular
        .module('cmd.components')
        .controller('Toolbarcontroller', Toolbarcontroller);

    /** @ngInject */
    function Toolbarcontroller(
        $scope,
        $mdMedia,
        $rootScope,
        $mdSidenav,
        STUDENT_ACCESS_LEVEL,
        LECTURER_ACCESS_LEVEL,
        COORDINATOR_ACCESS_LEVEL
    ) {

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
        self.STUDENT_ACCESS_LEVEL = STUDENT_ACCESS_LEVEL;
        self.LECTURER_ACCESS_LEVEL = LECTURER_ACCESS_LEVEL;
        self.COORDINATOR_ACCESS_LEVEL = COORDINATOR_ACCESS_LEVEL;

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
