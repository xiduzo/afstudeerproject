(function () {
    'use strict';

    angular
        .module('cmd.account')
        .controller('AccountLoginController', AccountLoginController);

    /** @ngInject */
    function AccountLoginController(
        $state,
        $scope,
        hotkeys,
        Account,
        Global,
        md5,
        Notifications
    ) {

        // If the user is logged in send him back to the homepage
        if(Global.getAccess() > 0) {
            return Global.notAllowed();
        }

        Global.setRouteTitle('CMD Athena');

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.login = login;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.login_form = {
            username: '',
            password: '',
            remember: false,
        };

        self.login_type = 'student';

        hotkeys.bindTo($scope)
        .add({
            combo: 'enter',
            description: 'login',
            callback: function() {
                self.login();
            }
        })
        ; // End of hotkeys

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function login() {
            Account.login(self.login_form.username, self.login_form.password, self.login_type)
                .then(function(response) {
                    if(response.uid) {

                        // Only work with the information we need
                        var logged_in_user = {
                            uid:               response.uid[0],
                            hvastudentnumber:  response.hvastudentnumber[0],
                            email:             response.mail[0].toLowerCase(),
                            initials:          response.initials[0],
                            displayname:       response.displayname[0],
                            surname_prefix:    response.hvatussenvoegsels ? response.hvatussenvoegsels[0] : null,
                            surname:           response.sn[0],
                            gender:            response.hvageslacht[0].toLowerCase() === 'm' ? 0 : 1,
                            is_staff:          self.login_type === 'student' ? false : true
                        };

                        Account.checkForExistingUser(logged_in_user.uid)
                        .then(function(response) {
                            if(response.status === -1) {
                                return Global.noConnection();
                            }
                            if(response.length) {
                                response[0].password = md5(self.login_form.password);
                                Account.setUser(response[0], self.login_form.remember);
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
                                    if(response.status === -1) {
                                        return Global.noConnection();
                                    }
                                    if(response) {
                                        logged_in_user.password = md5(self.login_form.password);
                                        Account.setUser(logged_in_user, self.login_form.remember);
                                    }
                                })
                                .catch(function() {
                                    // Err
                                });
                            }
                        });

                    } else {
                      if(self.login_type === 'student') {
                        self.login_type = 'lecturer';
                        self.login();
                      } else {
                        Notifications.simpleToast(response.message);
                      }
                    }
                });
        }

    }

}());
