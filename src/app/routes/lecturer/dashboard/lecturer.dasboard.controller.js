(function () {
    'use strict';

    angular
        .module('cmd.home')
        .controller('LecturerDashboardController', LecturerDashboardController);

    /** @ngInject */
    function LecturerDashboardController(
        Global
    ) {

        var self = this;


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();

        Global.setRouteTitle('Dashboard');

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    }

}());
