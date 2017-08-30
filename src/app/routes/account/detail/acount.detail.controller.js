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
        Account,
        Notifications,
        localStorageService,
        STUDENT_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < STUDENT_ACCESS_LEVEL) {
            return Global.notAllowed();
        }

        Global.setRouteTitle('Profiel');
        Global.setRouteBackRoute(null);

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
        function patchLocalSettings(ask_for_password) {
          Global.setLocalSettings(self.local_settings);
          $rootScope.$broadcast('patched-local-settings');
        }

    }

}());
