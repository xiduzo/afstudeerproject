(function () {
    'use strict';

    angular
        .module('cmd.account')
        .controller('AccountSettingsController', AccountSettingsController);

    /** @ngInject */
    function AccountSettingsController(
        Global,
        STUDENT_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < STUDENT_ACCESS_LEVEL) {
            $mdToast.show(
                $mdToast.simple()
                .textContent('You are not allowed to view this page')
                .position('bottom right')
                .hideDelay(3000)
            );
            $state.go('base.home');
            return;
        }

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    }

}());
