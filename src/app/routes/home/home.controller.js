(function () {
    'use strict';

    angular
        .module('cmd.home')
        .controller('HomeController', HomeController);

    /** @ngInject */
    function HomeController(
        $state,
        Global
    ) {

        var self = this;


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        if(self.user.is_superuser) {
            $state.go('base.home.dashboards.lecturer');
        } else if (self.user.is_staff) {

        } else {

        }

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    }

}());
