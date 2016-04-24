(function () {
    'use strict';

    angular
        .module('cmd.account')
        .controller('AccountLoginController', AccountLoginController);

    /** @ngInject */
    function AccountLoginController(
        $mdToast,
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

                        // Only work with the information we need
                        var logged_in_user = {
                            uid:               response.uid[0],
                            hvastudentnumber:  response.hvastudentnumber[0],
                            email:             response.mail[0].toLowerCase(),
                            initials:          response.initials[0],
                            surname:           response.sn[0],
                            displayname:       response.displayname[0],
                            gender:            response.hvageslacht[0],
                            preferredlanguage: response.preferredlanguage[0],
                            lastlogin:         new Date(),
                            access:            self.login_form.login_type === 'medewerker' ? 2 : 1
                        };

                        Account
                            .checkForExistingUser(logged_in_user.uid)
                            .then(function(response) {

                                if(response) {
                                    Account.setUser(logged_in_user);
                                } else {
                                    // Create user into the database
                                    console.log('creating user');
                                    Account
                                        .createUser(logged_in_user)
                                        .then(function(response) {
                                            // TODO
                                            // Do somethin when the user is created
                                            Account.setUser(logged_in_user);
                                        });
                                }
                            });

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
