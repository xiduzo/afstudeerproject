(function () {
    'use strict';

    angular
        .module('cmd.worlds')
        .controller('WorldsSettingsController', WorldsSettingsController);

    /** @ngInject */
    function WorldsSettingsController(
        $mdDialog,
        $state,
        $stateParams,
        $scope,
        hotkeys,
        Global,
        Notifications,
        World,
        COORDINATOR_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < COORDINATOR_ACCESS_LEVEL) {
            return Global.notAllowed();
        }

        Global.setRouteTitle('Class settings');
        Global.setRouteBackRoute('base.worlds.overview');

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.deleteWorld = deleteWorld;
        self.changeWorldName = changeWorldName;
        self.addHotkeys = addHotkeys;
        self.patchWorldSettings = patchWorldSettings;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.world = [];
        self.loading_page = true;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        World.getWorld($stateParams.worldUuid)
            .then(function(response) {
                if(response.status === 404) {
                    Notifications.simpleToast('Class ' + $stateParams.worldUuid + ' does not exist');
                    $state.go('base.guilds.overview');
                }

                response.start = new Date(moment(response.start));
                self.world = response;

                if(Global.getLocalSettings().enabled_hotkeys) {
                    self.addHotkeys();
                }
                self.loading_page = false;

            }, function() {
                // Err
            });


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function deleteWorld(event) {
            Notifications.confirmation(
                'Are you sure you want to delete this class?',
                'Please consider your answer, this action can not be undone.',
                'Delete class',
                event
            )
            .then(function() {
                World.deleteWorld(self.world.id)
                    .then(function(response) {
                        Notifications.simpleToast('Class ' + self.world.name + ' has been deleted');
                        $state.go('base.worlds.overview');
                    }, function() {
                        // Err
                    });
            }, function() {
                // No
            });
        }

        function changeWorldName(event) {
            Notifications.prompt(
                'Change the class name of \'' +self.world.name+ '\'',
                'How would you like to name this class?',
                'Class name',
                event
            )
            .then(function(result) {
                if(!result) {
                    return Notifications.simpleToast('Please enter a name');
                }

                World.changeWorldName(result, self.world.id)
                .then(function(response) {
                    self.world.name = result;
                    Notifications.simpleToast('Name change to ' + result);
                }, function() {
                    // Err
                });

            }, function() {
                // Cancel
            });
        }

        function addHotkeys() {
            hotkeys.bindTo($scope)
            .add({
                combo: 'shift+c',
                description: 'Change class name',
                callback: function(event) {
                    event.preventDefault();
                    self.changeWorldName();
                }
            })
            .add({
                combo: 'shift+r',
                description: 'Add rule',
                callback: function(event) {
                    event.preventDefault();
                    self.addRule();
                }
            })
            .add({
                combo: 'shift+d',
                description: 'Delete ' + self.world.name,
                callback: function(event) {
                    event.preventDefault();
                    self.deleteWorld();
                }
            })

            ; // End of hotkeys
        }

        function patchWorldSettings() {
            World.patchWorldSettings(self.world)
            .then(function(response) {
                Notifications.simpleToast('Class settings updated');
            })
            .catch(function(error) {
                console.log(error);
            });
        }

    }

}());
