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
        toastr,
        localStorageService,
        COORDINATOR_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < COORDINATOR_ACCESS_LEVEL) {
            return Global.notAllowed();
        }

        Global.setRouteTitle('Klas instellingen');
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
                  toastr.error('Klass ' + $stateParams.worldUuid + ' bestaad niet');
                  $state.go('base.worlds.overview');
              }

              Global.setRouteTitle('Klas instellingen ' + response.name);
              response.start = response.start ? new Date(moment(response.start)) : null;
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
          if(Global.getLocalSettings().enabled_confirmation) {
            Notifications.confirmation(
                'Weet je zeker dat je deze klas wilt verwijderen?',
                'Deze actie kan niet meer ongedaan worden.',
                'verwijder klas',
                event
            )
            .then(function() {
                removeWorldFromBackend();
            }, function() {
                // No
            });
          } else {
            removeWorldFromBackend();
          }
        }

        function removeWorldFromBackend(world) {
          World.deleteWorld(self.world.id)
          .then(function(response) {
              toastr.success('klas ' + self.world.name + ' is verwijderd');
              $state.go('base.worlds.overview');
          }, function() {
              // Err
          });
        }

        function changeWorldName(event) {
            Notifications.prompt(
                'Verander de klas naam van \'' +self.world.name+ '\'',
                'Wat wordt de nieuwe naam van deze klas?',
                'Klas naam',
                event
            )
            .then(function(result) {
                if(!result) {
                    return toastr.warning('Please enter a name');
                }

                World.changeWorldName(result, self.world.id)
                .then(function(response) {
                    self.world.name = result;
                    toastr.success('Naam gewijzigd naar ' + result);
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
                description: 'Verander klas naam',
                callback: function(event) {
                    event.preventDefault();
                    self.changeWorldName();
                }
            })
            .add({
                combo: 'shift+d',
                description: 'Verwijder ' + self.world.name,
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
                toastr.success('Class settings updated');
            })
            .catch(function(error) {
                console.log(error);
            });
        }

    }

}());
