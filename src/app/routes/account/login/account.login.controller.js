(function () {
    'use strict';

    angular
        .module('cmd.account')
        .controller('AccountLoginController', AccountLoginController);

    /** @ngInject */
    function AccountLoginController($scope, $state, $rootScope) {

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.login = login;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = $scope.Global.data.user;
        self.username = '';
        self.password = '';
        self.login_type = "student";


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function login() {
            // TODO
            // Login the user using the LDAP system

            // TODO
            // Set the access level depending on the type of user is returned
            self.user.access = self.login_type === 'student' ? 1 : (self.login_type === 'lecturer' ? 2 : 3);

            // TODO
            // Set the localStorage

            // TODO
            // Handle the response
            $rootScope.$broadcast('user-changed');
            $state.go('base.home');
        }

    }

}());
