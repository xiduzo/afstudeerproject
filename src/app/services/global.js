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
                self.functions.getAccessLevel(user);
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
                        $state.go('base.home.dashboards.coordinator');
                    } else if(user.is_staff) {
                        self.access = 2;
                        $state.go('base.home.dashboards.lecturer');
                    } else {
                        self.access = 1;
                        $state.go('base.home.dashboards.student');
                    }

                    $rootScope.$broadcast('new-user-set');

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
        });

        if(localStorageService.get('user')) {
            self.functions.setUser(localStorageService.get('user'));
        }

        if(localStorageService.get('settings')) {
            self.local_settings = localStorageService.get('settings');
        } else {
            localStorageService.set('settings', self.local_settings);
        }

        return self.functions;

    }

}());
