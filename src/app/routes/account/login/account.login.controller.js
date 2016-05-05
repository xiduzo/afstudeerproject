(function () {
    'use strict';

    angular
        .module('cmd.account')
        .controller('AccountLoginController', AccountLoginController);

    /** @ngInject */
    function AccountLoginController(
        $mdToast,
        $state,
        Account,
        Global
    ) {

        // If the user is logged in send him back to the homepage
        if(Global.getAccess() > 0) {
            $state.go('base.home');
            return;
        }

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

            Account.login(self.login_form.username, self.login_form.password, self.login_form.login_type)
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
                            access:            self.login_form.login_type === 'student' ? 1 : 2
                        };

                        Account.checkForExistingUser(logged_in_user.uid)
                            .then(function(response) {

                                if(response) {
                                    // If the user exist in the DB
                                    // Patch last login and set user
                                    Account.patchLastLogin(logged_in_user.uid)
                                        .then(function() {
                                            Account.setUser(logged_in_user);
                                        }, function() {
                                            // Err
                                        });
                                } else {
                                    // TODO
                                    // When the user is logging in for the first times
                                    // I think they can give themself access level 2 when they
                                    // Manipulate the logged_in_user object before this service is fired
                                    //
                                    // On the other hand, they are first year students so let's just assume
                                    // They do not have the expertice to do this (yet...)


                                    // Create user into the database
                                    Account.createUser(logged_in_user)
                                        .then(function(response) {
                                            if(response) {
                                                Account.setUser(logged_in_user);
                                            }
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
