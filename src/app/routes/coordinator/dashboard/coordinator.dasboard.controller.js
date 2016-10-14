(function () {
    'use strict';

    angular
        .module('cmd.home')
        .controller('CoordinatorDashboardController', CoordinatorDashboardController);

    /** @ngInject */
    function CoordinatorDashboardController(
        Global
    ) {

        Global.setRouteTitle('Dashboard');
        
        var self = this;


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    }

}());
