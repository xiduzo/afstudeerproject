(function () {
  'use strict';

  angular.module('cmd.services').factory('Global', Global);

  /** @ngInject */
  function Global(
    $mdToast,
    $state,
    $translate,
    $rootScope,
    localStorageService,
    Account,
    Notifications,
    toastr
  ) {
    var self = this;

    self.user = {};
    self.access = null;
    self.active_page = '';
    self.selected_world = null;
    self.selected_guild = null;
    self.toState = null;
    self.toStateParams = null;
    self.language = 'nl-NL';
    self.local_settings = {
      enabled_confirmation: true,
      enabled_hotkeys: true,
    };

    self.functions = {
      setUser: function (user) {
        console.log(user);
        self.user = user;
        self.functions.getAccessLevel(user);
      },
      getUser: function () {
        return self.user;
      },
      clearUser: function () {
        self.access = 0;
        self.user = {};
      },
      getAccess: function () {
        return Number(self.access);
      },
      notAllowed: function () {
        toastr.warning('Je bent niet gemachtigd deze pagina te bekijken');
      },
      noConnection: function () {
        toastr.error('Er lijkt iets mis te gaan met de database connectie');
      },
      statusCode: function (response) {
        Notifications.simpleToast(response.status + ': ' + response.statusText);
      },
      setActivePage: function (page) {
        self.page = page;
      },
      getAcitvePage: function () {
        return self.page;
      },
      setToState: function (state, params) {
        self.toState = state.name === 'base.account.login' ? self.toState : state;
        self.toStateParams = state.name === 'base.account.login' ? self.toStateParams : params;
      },
      getAccessLevel: function (user, set_user) {
        Account.getAccessLevel(user.email).then(function (response) {
          if (response.status === -1) {
            return self.functions.noConnection();
          }

          var user = response[0];

          if (user.is_superuser) {
            self.access = 3;
            $state.go('base.worlds.overview');
          } else if (user.is_staff) {
            self.access = 2;
            $state.go('base.home.dashboards.lecturer');
          } else {
            self.access = 1;
            $state.go('base.home.dashboards.student');
          }

          localStorageService.set('access', self.access);

          setTimeout(function () {
            if (self.toState) {
              if (self.toStateParams) {
                $state.go(self.toState.name, self.toStateParams);
              } else {
                $state.go(self.toState.name);
              }
              self.toState = null;
            } else {
              $state.go('base.home');
            }
            $rootScope.$broadcast('new-user-set');
          }, 100);
        });
      },
      setSelectedGuild: function (guild) {
        if (guild !== self.selected_guild) {
          self.selected_guild = guild;
          $rootScope.$broadcast('guild-changed', guild);
        }
      },
      getSelectedGuild: function () {
        return self.selected_guild;
      },
      setSelectedWorld: function (world) {
        if (world !== self.selected_world) {
          self.selected_world = world;
          $rootScope.$broadcast('world-changed', world);
        }
      },
      getSelectedWorld: function () {
        return self.selected_world;
      },
      setRouteTitle: function (title) {
        if (self.active_page) {
          $rootScope.$broadcast('route-title', title);
        } else {
          self.active_page = title;
          setTimeout(function () {
            $rootScope.$broadcast('route-title', title);
          }, 100);
        }
      },
      setRouteBackRoute: function (route, params) {
        setTimeout(function () {
          $rootScope.$broadcast('back-route', route, params);
        }, 50);
      },
      getLocalSettings: function () {
        return self.local_settings;
      },
      setLocalSettings: function (settings) {
        self.local_settings = settings;
        localStorageService.set('settings', self.local_settings);
        toastr.success($translate.instant('JS_SETTING_SAVED'));
      },
      getLanguage: function () {
        return self.language;
      },
      setLanguage: function (language) {
        localStorageService.set('language', language);
        self.language = language;
        switch (language) {
          case 'nl-NL':
            moment.locale('nl');
            $translate.use(language);
            break;
          case 'en-EN':
            moment.locale('en');
            $translate.use(language);
            break;
        }
      },
    };

    $rootScope.$on('new-user-login', function (event, user) {
      self.functions.setUser(user);
    });

    if (localStorageService.get('user')) {
      self.functions.setUser(localStorageService.get('user'));
    }

    if (localStorageService.get('access')) {
      self.access = localStorageService.get('access');
    }

    if (localStorageService.get('settings')) {
      self.local_settings = localStorageService.get('settings');
    } else {
      localStorageService.set('settings', self.local_settings);
    }

    if (localStorageService.get('language')) {
      var language = localStorageService.get('language');
      self.functions.setLanguage(language);
    }

    return self.functions;
  }
})();
