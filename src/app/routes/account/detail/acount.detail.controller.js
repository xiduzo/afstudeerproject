(function () {
    'use strict';

    angular
        .module('cmd.account')
        .controller('AccountDetailController', AccountDetailController);

    /** @ngInject */
    function AccountDetailController(
        $mdDialog,
        $rootScope,
        $state,
        Global,
        TrelloApi,
        md5,
        Notifications,
        localStorageService,
        STUDENT_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < STUDENT_ACCESS_LEVEL) {
            return Global.notAllowed();
        }

        Global.setRouteTitle('Profiel');

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.patchLocalSettings = patchLocalSettings;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.trello_account = null;
        self.loading_page = true;
        self.local_settings = Global.getLocalSettings();

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        TrelloApi.Authenticate()
        .then(function(response) {
            TrelloApi.Rest('GET', 'members/me')
            .then(function(response) {
                self.trello_account = response;
                self.loading_page = false;
            });
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function patchLocalSettings() {
            if(!self.local_settings.password_protection) {
                $mdDialog.show({
                    controller: 'passwordProtectionController',
                    controllerAs: 'passwordProtectionCtrl',
                    templateUrl: 'app/components/password_protection/password_protection.html',
                    targetEvent: event,
                    clickOutsideToClose: true,
                    locals: {
                        reason: 'Om deze wijziging door te voeren is je wachtwoord vereist.'
                    }
                })
                .then(function(result) {
                    if(!result) {
                        self.local_settings.password_protection = true;
                        return Notifications.simpleToast('Please enter a password');
                    }

                    if(md5(result) === self.user.password) {
                        Global.setLocalSettings(self.local_settings);
                        $rootScope.$broadcast('patched-local-settings');
                    } else {
                        self.local_settings.password_protection = true;
                        Global.setLocalSettings(self.local_settings);
                    }

                }, function() {
                    self.local_settings.password_protection = true;
                    Global.setLocalSettings(self.local_settings);
                });
            } else {
                Global.setLocalSettings(self.local_settings);
                $rootScope.$broadcast('patched-local-settings');
            }
        }

    }

}());
