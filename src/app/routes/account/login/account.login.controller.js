(function () {
    'use strict';

    angular
        .module('cmd.account')
        .controller('AccountLoginController', AccountLoginController);

    /** @ngInject */
    function AccountLoginController(
        $mdToast,
        $scope,
        $state,
        $rootScope,
        Account
    ) {

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.login = login;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        // objects
        self.login_form = {
            username: '',
            password: '',
            login_type: 'student'
        };

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function login() {

            Account
                .login(self.login_form.username, self.login_form.password, self.login_form.login_type)
                .then(function(response) {
                    if(response.uid) {
                        // TODO
                        // Check for user in DB, else create one
                        $scope.Global.data.user.data = response;

                        // TODO
                        // Add some kind of lecturer / coordinator check
                        $scope.Global.data.user.access = self.login_form.login_type === "student" ? 1 : 2;

                        $rootScope.$broadcast('user-changed');
                        $state.go('base.home');

                    } else {
                        $mdToast.show(
                            $mdToast.simple()
                            .textContent(response.message)
                            .position('bottom right')
                            .hideDelay(3000)
                        );
                    }
                });
        }

    }

}());
