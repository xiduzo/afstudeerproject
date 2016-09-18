(function () {
    'use strict';

    angular
        .module('cmd.services')
        .factory('Notifications', Notifications);

    /** @ngInject */
    function Notifications(
        $mdToast
    ) {

        var services = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        services.simpleToast = simpleToast;

        return services;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function simpleToast(toast, duration) {
            $mdToast.show(
                $mdToast.simple()
                .textContent(toast)
                .position('bottom right')
                .hideDelay(duration || 3000)
            );
        }
    }

}());
