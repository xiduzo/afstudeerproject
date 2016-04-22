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
        Account,
        localStorageService
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

                        // Only work with the information we need
                        var logged_in_user = {
                            preferredlanguage: response.preferredlanguage[0],
                            mail:              response.mail[0],
                            uid:               response.uid[0],
                            surname:           response.sn[0],
                            initials:          response.initials[0],
                            gender:            response.hvageslacht[0],
                            displayname:       response.displayname[0],
                            hvastudentnumber:  response.hvastudentnumber[0],
                            lastlogin:         response.modifytimestamp[0],
                        };

                        localStorageService.set('user', logged_in_user);
                        $scope.Global.setUser(logged_in_user);

                        // TODO
                        // Add some kind of lecturer / coordinator check
                        localStorageService.set('access', self.login_form.login_type === "student" ? 1 : 2);
                        $scope.Global.setAccess(self.login_form.login_type === "student" ? 1 : 2);

                        // Set localStorage

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
