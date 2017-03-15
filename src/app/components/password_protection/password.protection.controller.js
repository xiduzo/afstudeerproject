(function () {
    'use strict';

    angular
        .module('cmd.components')
        .controller('passwordProtectionController', passwordProtectionController);

    /** @ngInject */
    function passwordProtectionController(
        $mdDialog,
        reason
    ) {

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.close = close;
        self.controlPassword = controlPassword;
        self.reason = reason;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.password = null;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Functions
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function close() {
            $mdDialog.hide();
        }

        function controlPassword() {
          $mdDialog.hide(self.password);
        }

    }

}());
