(function () {
  'use strict';

  angular.module('cmd.account').controller('AccountDetailController', AccountDetailController);

  /** @ngInject */
  function AccountDetailController(
    $rootScope,
    $translate,
    Global,
    TrelloApi,
    Account,
    localStorageService,
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
    self.changeLanguage = changeLanguage;

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    self.user = Global.getUser();
    self.user.trello = localStorageService.get('trello_user') ? true : false;
    self.trello_account = null;
    self.loading_page = true;
    self.local_settings = Global.getLocalSettings();
    self.language = Global.getLanguage();

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    if (self.user.trello) {
      TrelloApi.Authenticate()
        .then(function () {
          TrelloApi.Rest('GET', 'members/me').then(function (response) {
            localStorageService.set('trello_user', response);

            var userAvatar = null;

            if (response.avatarUrl) {
              userAvatar = response.avatarUrl;
            } else if (response.uploadedAvatarUrl) {
              userAvatar = response.uploadedAvatarUrl;
            } else if (response.id) {
              if (response.avatarHash) {
                userAvatar =
                  'https://trello-members.s3.amazonaws.com/' +
                  response.id +
                  '/' +
                  response.avatarHash;
              } else if (response.uploadedAvatarHash) {
                userAvatar =
                  'https://trello-members.s3.amazonaws.com/' +
                  response.id +
                  '/' +
                  response.uploadedAvatarHash;
              }
            }

            self.user.avatar_hash = userAvatar;

            Account.patchAvatarHash(self.user);

            self.trello_account = response;
          });
          self.loading_page = false;
        })
        .catch(function () {
          self.loading_page = false;
        });
    } else {
      self.loading_page = false;
    }

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    function patchLocalSettings() {
      Global.setLocalSettings(self.local_settings);
      $rootScope.$broadcast('patched-local-settings');
    }

    function changeLanguage() {
      Global.setLanguage(self.language);
    }
  }
})();
