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
        TrelloApi,
        md5,
        Notifications,
        localStorageService
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
        self.authenticateTrello = authenticateTrello;
        self.setUser = setUser;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.login_form = {
            username: null,
            password: null,
            remember: true,
        };

        self.login_type = 'student';
        self.error = null;

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
        function authenticateTrello(user) {
            TrelloApi.Authenticate()
            .then(function(){
                TrelloApi.Rest('GET', 'members/me')
                .then(function(response) {
                    localStorageService.set('trello_user', response);
                    Notifications.simpleToast('Authentication succeeded');
                    self.setUser(user);
                });
            })
            .catch(function() {
                self.error = 'Verifieer een trello account om door te kunnen gaan.';
                Notifications.simpleToast('Authentication failed');
            });
        }

        function setUser(user) {
            Account.setUser(user, self.login_form.remember);
        }

        function login() {
            Account.login(self.login_form.username, self.login_form.password, self.login_type)
                .then(function(response) {
                    if(response.uid) {

                        var logged_in_user  = {
                            uid:               response.uid[0],
                            student_number:    response.hvastudentnumber ? response.hvastudentnumber[0] : null,
                            email:             response.mail[0].toLowerCase(),
                            initials:          response.initials[0],
                            first_name:        response.displayname[0],
                            surname_prefix:    response.hvatussenvoegsels ? response.hvatussenvoegsels[0] : null,
                            surname:           response.sn[0],
                            gender:            response.hvageslacht[0].toLowerCase() === 'm' ? 0 : 1,
                            is_staff:          self.login_type === 'student' ? false : true,
                            is_superuser:      false,
                        };

                        Account.checkForExistingUser(logged_in_user.uid)
                        .then(function(response) {
                            if(response.status === -1) {
                                return Global.noConnection();
                            }
                            if(response.length) {
                                response[0].password = md5(self.login_form.password);
                                if(!localStorageService.get('trello_user')) {
                                    self.authenticateTrello(response[0]);
                                } else {
                                    self.setUser(response[0], self.login_form.remember);
                                }
                            } else {
                                // TODO
                                // When the user is logging in for the first times
                                // I think they can give themself access when they
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
                                        if(!localStorageService.get('trello_user')) {
                                            self.authenticateTrello(response);
                                        } else {
                                            self.setUser(response, self.login_form.remember);
                                        }
                                    }
                                })
                                .catch(function() {
                                    // Err
                                });
                            }
                        });

                    } else {
                      if(self.login_type === 'student') {
                        self.login_type = 'medewerker';
                        self.login();
                      } else {
                        if(response.status === -1) {
                          self.error = "There seems to be a problem establishing a database connection";
                          return Global.noConnection();
                        }
                        self.error = response.message;
                        Notifications.simpleToast(response.message);
                      }
                    }
                });
        }

    }

}());
