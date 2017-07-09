(function () {
    'use strict';

    angular
        .module('cmd.home')
        .controller('HomeController', HomeController);

    /** @ngInject */
    function HomeController(
        $scope,
        $state,
        Global
    ) {

        var self = this;


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.routeUser = routeUser;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Broadcasts
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        $scope.$on('new-user-set', function(event) {
            self.user = Global.getUser();
            self.routeUser(self.user);
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        routeUser(self.user);

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function routeUser(user) {
          if(user.is_superuser) {
            $state.go('base.worlds.overview');
          } else if(user.is_staff) {
            $state.go('base.home.dashboards.lecturer');
          } else {
            $state.go('base.home.dashboards.student');
          }
        }

    }

}());
