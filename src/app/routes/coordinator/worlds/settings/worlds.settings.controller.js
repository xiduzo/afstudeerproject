(function () {
    'use strict';

    angular
        .module('cmd.worlds')
        .controller('WorldsSettingsController', WorldsSettingsController);

    /** @ngInject */
    function WorldsSettingsController(
        COORDINATOR_ACCESS_LEVEL
    ) {

        if(Global.getAccess() !== COORDINATOR_ACCESS_LEVEL) {
            $mdToast.show(
                $mdToast.simple()
                .textContent('You are not allowed to view this page')
                .position('bottom right')
                .hideDelay(3000)
            );
            $state.go('base.home');
            return;
        }

        var vm = this;


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    }

}());
