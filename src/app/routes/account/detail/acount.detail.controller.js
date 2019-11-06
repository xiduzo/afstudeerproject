(function() {
  'use strict';

  angular.module('cmd.account').controller('AccountDetailController', AccountDetailController);

  /** @ngInject */
  function AccountDetailController(
    $rootScope,
    $translate,
    Global,
    TrelloApi,
    Account,
    STUDENT_ACCESS_LEVEL
  ) {
    if (Global.getAccess() < STUDENT_ACCESS_LEVEL) {
      return Global.notAllowed();
    }

    Global.setRouteTitle($translate.instant('PROFILE'));
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
    TrelloApi.Authenticate().then(function(response) {
      TrelloApi.Rest('GET', 'members/me').then(function(response) {
        if (response.uploadedAvatarHash) {
          self.user.avatar_hash = response.uploadedAvatarHash;
          Account.patchAvatarHash(self.user);
        }
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
})();
