(function () {
    'use strict';

    angular
        .module('cmd.services')
        .factory('Global', Global);

    /** @ngInject */
    function Global(
        $mdToast,
        $state,
        $rootScope,
        localStorageService,
        Account,
        Notifications
    ) {

        var self = this;

        self.user = {};
        self.access = null;
        self.active_page = '';
        self.selected_world = null;
        self.selected_guild = null;
        self.local_settings = {
            enabled_confirmation: true,
            enabled_hotkeys: true,
            password_protection: true
        };

        self.functions = {
            setUser: function(user) {
                self.user = user;
                self.functions.getAccessLevel(user, true);
            },
            getUser: function() {
                return self.user;
            },
            clearUser: function() {
                self.access = 0;
                self.user = {};
            },
            getAccess: function() {
                return Number(self.access);
            },
            notAllowed: function() {
                Notifications.simpleToast('You are not allowed to view this page');
                $state.go('base.home');
            },
            noConnection: function() {
                Notifications.simpleToast('There seems to be a problem establishing a database connection');
            },
            statusCode: function(response) {
                Notifications.simpleToast(response.status+': '+response.statusText);
            },
            setActivePage: function(page) {
                self.page = page;
            },
            getAcitvePage: function() {
                return self.page;
            },
            getAccessLevel: function(user, set_user) {
                Account.getAccessLevel(user.uid)
                .then(function(response) {
                    if(response.status === -1) {
                        return self.functions.noConnection();
                    }

                    var user = response[0];

                    if(user.is_superuser) {
                        self.access = 3;
                    } else if(user.is_staff) {
                        self.access = 2;
                    } else {
                        self.access = 1;
                    }
                    
                    // self.access = 1;

                    if(set_user) {
                        $state.go('base.home');
                        $rootScope.$broadcast('new-user-set');
                    } else {
                      $rootScope.$broadcast('user-logged-out');
                    }

                });
            },
            setSelectedGuild: function(guild) {
                self.selected_guild = guild;
                $rootScope.$broadcast('guild-changed', guild);
            },
            getSelectedGuild: function() {
                return self.selected_guild;
            },
            setSelectedWorld: function(world) {
                self.selected_world = world;
                $rootScope.$broadcast('world-changed', world);
            },
            getSelectedWorld: function() {
                return self.selected_world;
            },
            setRouteTitle: function(title) {
                if(self.active_page) {
                    $rootScope.$broadcast('route-title', title);
                } else {
                    self.active_page = title;
                    setTimeout(function () {
                        $rootScope.$broadcast('route-title', title);
                    }, 100);
                }
            },
            setRouteBackRoute: function(route, params) {
                setTimeout(function () {
                    $rootScope.$broadcast('back-route', route, params);
                }, 50);
            },
            getLocalSettings: function() {
                return self.local_settings;
            },
            setLocalSettings: function(settings) {
                self.local_settings = settings;
                localStorageService.set('settings', self.local_settings);
                Notifications.simpleToast('Settings patched');
            },
        };

        $rootScope.$on('new-user-login', function(event, user) {
            self.functions.setUser(user);
            self.functions.getAccessLevel(user, true);
        });

        if(localStorageService.get('user')) {
            self.user = localStorageService.get('user');
            self.functions.getAccessLevel(self.user, true);
        }

        if(localStorageService.get('settings')) {
            self.local_settings = localStorageService.get('settings');
        } else {
            localStorageService.set('settings', self.local_settings);
        }

        return self.functions;

    }

}());
