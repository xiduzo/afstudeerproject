(function() {
  'use strict';

  angular.module('cmd.worlds').controller('WorldsOverviewController', WorldsOverviewController);

  /** @ngInject */
  function WorldsOverviewController(
    $scope,
    $state,
    $mdDialog,
    $mdToast,
    $translate,
    hotkeys,
    Account,
    Global,
    Notifications,
    World,
    toastr,
    COORDINATOR_ACCESS_LEVEL,
    HTTP_STATUS
  ) {
    if (Global.getAccess() < COORDINATOR_ACCESS_LEVEL) {
      return Global.notAllowed();
    }

    Global.setRouteTitle($translate.instant('JS_CLASSES_OVERVIEW'));
    Global.setRouteBackRoute(null);

    var vm = this;

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    vm.moveGamemaster = moveGamemaster;
    vm.newWorldDialog = newWorldDialog;
    vm.addGamemaster = addGamemaster;
    vm.removeGamemaster = removeGamemaster;
    vm.addHotkeys = addHotkeys;

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    vm.worlds = [];
    vm.loading_page = true;

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    World.V2getWorlds()
      .then(function(response) {
        vm.loading_page = false;
        if (response.status === HTTP_STATUS.SUCCESS) {
          _.each(response.data, function(world, index) {
            world.gamemasters = _.map(world.gamemasters, function(gamemaster) {
              gamemaster = gamemaster.user;
              gamemaster.world_id = world.id;
              return gamemaster;
            });
            vm.worlds.push(world);
          });
        }
      })
      .catch(function(error) {
        toastr.error(error);
      });

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    if (Global.getLocalSettings().enabled_hotkeys) {
      vm.addHotkeys();
    }

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    function moveGamemaster(event, world, gamemaster) {
      if (world.id === gamemaster.world_id) {
        return false;
      }

      if (_.where(world.gamemasters, { id: gamemaster.id }).length >= 2) {
        // Remove duplicate gamemasters in world
        World.removeGamemasterFromWorld(gamemaster.id, gamemaster.world_id);
        world.gamemasters.splice(world.gamemasters.indexOf(gamemaster), 1);
        toastr.info(
          gamemaster.first_name +
            ' ' +
            $translate.instant('JS_ALLREADY_WAS_A_TEACHER_OF') +
            ' ' +
            world.name
        );
      } else {
        World.removeGamemasterFromWorld(gamemaster.id, gamemaster.world_id);
        World.addGamemasterToWorld(gamemaster.url, world.url)
          .then(function(response) {
            if (response.status >= 400) {
              return Global.statusCode(response);
            }
            gamemaster.world_id = world.id;
            toastr.success(
              gamemaster.first_name + ' ' + $translate.instant('JS_ADDED_TO') + ' ' + world.name
            );
          })
          .catch(function(error) {
            toastr.error(error);
          });
      }
    }

    function newWorldDialog(event) {
      Notifications.prompt(
        $translate.instant('JS_ADD_CLASS'),
        $translate.instant('JS_NAME_OF_CLASS'),
        $translate.instant('JS_NAME_NEW_CLASS'),
        event
      ).then(
        function(result) {
          // Checks for a world name
          if (!result) {
            return toastr.warning('Vul een naam in.');
          }

          World.V2addWorld(result)
            .then(function(response) {
              if (response.status === HTTP_STATUS.CREATED) {
                vm.worlds.unshift(response.data);
                toastr.success(
                  $translate.instant('JS_CLASS') +
                    ' ' +
                    response.data.name +
                    ' ' +
                    $translate.instant('JS_ADDED')
                );
              } else {
                toastr.warning('Something went wrong, try again later');
              }
            })
            .catch(function(error) {
              toastr.error(error);
            });
        },
        function() {
          // Cancel dialog
        }
      );
    }

    function addGamemaster(event, world) {
      Account.getLecturers().then(
        function(response) {
          // Filter out the gamemaster allready in the world
          response = _.filter(response, function(user) {
            if (_.where(world.gamemasters, { id: user.id }).length === 0) {
              return user;
            }
          });

          $mdDialog
            .show({
              controller: 'AasController',
              controllerAs: 'aasCtrl',
              templateUrl: 'app/components/autocomplete_and_select/aas.html',
              targetEvent: event,
              clickOutsideToClose: true,
              locals: {
                title: $translate.instant('JS_ADD_TEACHER_TO') + ' ' + world.name,
                subtitle: $translate.instant('JS_SELECT_TEACHERS'),
                about: $translate.instant('TEACHERS'),
                players: response,
                guildUuid: world.uuid,
              },
            })
            .then(
              function(response) {
                if (!response) {
                  return;
                }

                _.each(response, function(user) {
                  World.addGamemasterToWorld(user.url, world.url).then(
                    function(response) {
                      if (response.status >= 400) {
                        return Global.statusCode(response);
                      }
                      user.world_id = world.id;
                      world.gamemasters.push(user);
                      toastr.success(
                        user.first_name + ' ' + $translate.instant('JS_ADDED_TO') + ' ' + world.name
                      );
                    },
                    function() {
                      // Err adding gamemaster to world
                    }
                  );
                });
              },
              function() {
                // Cancel dialog
              }
            );
        },
        function() {
          // Err getting lecturers
        }
      );
    }

    function removeGamemaster(gamemaster, world) {
      World.removeGamemasterFromWorld(gamemaster.id, world.id)
        .then(function(response) {
          toastr.success(
            gamemaster.first_name +
              ' ' +
              $translate.instant('JS_IS_REMOVED_FROM') +
              ' ' +
              world.name
          );
          world.gamemasters.splice(world.gamemasters.indexOf(gamemaster), 1);
        })
        .catch(function(error) {
          toastr.error(error);
        });
    }

    function addHotkeys() {
      hotkeys.bindTo($scope).add({
        combo: 'shift+c',
        description: $translate.instant('JS_NEW_CLASS'),
        callback: function(event) {
          event.preventDefault();
          vm.newWorldDialog(event);
        },
      });
    }
  }
})();
