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
      COORDINATOR_ACCESS_LEVEL,
      HTTP_STATUS
    ) {

        if(Global.getAccess() < COORDINATOR_ACCESS_LEVEL) {
          return Global.notAllowed();
        }

        Global.setRouteTitle('Klas instellingen');
        Global.setRouteBackRoute('base.worlds.overview');

        var vm = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        vm.deleteWorld = deleteWorld;
        vm.changeWorldName = changeWorldName;
        vm.addHotkeys = addHotkeys;
        vm.patchWorldSettings = patchWorldSettings;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        vm.world = [];
        vm.loading_page = true;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        World.V2getWorld($stateParams.worldUuid)
        .then(function(response) {
          if(response.status === HTTP_STATUS.NOT_FOUND) {
            toastr.error('Klass ' + $stateParams.worldUuid + ' bestaad niet');
            return $state.go('base.worlds.overview');
          }

          response = response.data;

          Global.setRouteTitle('Klas instellingen ' + response.name);

          vm.loading_page = false;

          response.start = response.start ? new Date(moment(response.start)) : null;
          response.gamemasters = _.map(response.gamemasters, function(gamemaster) {
            gamemaster = gamemaster.user;
            gamemaster.world_id = response.id;
            return gamemaster;
          });

          vm.world = response;

          if(Global.getLocalSettings().enabled_hotkeys) {
            vm.addHotkeys();
          }

        })
        .catch(function(error) {
          toastr.error(error);
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
          World.V2deleteWorld(vm.world.id)
          .then(function(response) {
              toastr.success('klas ' + vm.world.name + ' is verwijderd');
              $state.go('base.worlds.overview');
          })
          .catch(function(error) {
            toastr.error(error);
          });
        }

        function changeWorldName(event) {
            Notifications.prompt(
                'Verander de klas naam van \'' +vm.world.name+ '\'',
                'Wat wordt de nieuwe naam van deze klas?',
                'Klas naam',
                event
            )
            .then(function(result) {
              if(!result) {
                return toastr.warning('Please enter a name');
              }
              vm.world.name = result;

              World.V2patchWorld(vm.world)
              .then(function(response) {
                toastr.success('Naam gewijzigd naar: ' + result);
                Global.setRouteTitle('Klas instellingen ' + result);
              })
              .catch(function(error) {
                toastr.error(error);
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
              vm.changeWorldName();
            }
          })
          .add({
            combo: 'shift+d',
            description: 'Verwijder ' + vm.world.name,
            callback: function(event) {
              event.preventDefault();
              vm.deleteWorld();
            }
          })

          ; // End of hotkeys
        }

        function patchWorldSettings() {
          World.V2patchWorld(vm.world)
          .then(function(response) {
            toastr.success('Klas instellingen bijgewerkt');
          })
          .catch(function(error) {
            toastr.error(error);
          });
        }

    }

}());
