(function () {
    'use strict';

    angular
    .module('cmd.services')
    .factory('World', World);

    /** @ngInject */
    function World(
      $http,
      $q,
      toastr,
      REST_API_URL
    ) {

        var service = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        service.addGamemasterToWorld = addGamemasterToWorld;
        service.removeGamemasterFromWorld = removeGamemasterFromWorld;
        service.patchGamemasterWorld = patchGamemasterWorld;
        service.getWorldsOfGamemaster = getWorldsOfGamemaster;

        // V2
        service.V2getWorld = V2getWorld;
        service.V2getWorlds = V2getWorlds;

        service.V2addWorld = V2addWorld;

        service.V2patchWorld = V2patchWorld;

        service.V2deleteWorld = V2deleteWorld;

        return service;
        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        // V2
        function V2getWorld(id) {
            return $http({
                url: REST_API_URL + 'world/v2-worlds/'+id+'/',
                method: "GET"
            })
            .then(function(response) {
                return response;
            }, function(error) {
                return error;
            });
        }

        function V2getWorlds() {
          return $http({
            url: REST_API_URL + 'world/v2-worlds/',
            method: "GET"
          })
          .then(function(response) { return response; })
          .catch(function(error) { toastr.error(error); });
        }

        function V2addWorld(name) {
          return $http({
            url: REST_API_URL + 'world/v2-worlds/',
            method: "POST",
            data: { name: name }
          })
          .then(function(response) { return response; })
          .catch(function(error) { toastr.error(error); });
        }

        function V2patchWorld(world) {
          return $http({
              url: REST_API_URL + 'world/v2-worlds/'+world.id+'/',
              method: "PATCH",
              data: world
          })
          .then(function(response) { return response; })
          .catch(function(error) { toastr.error(error); });
        }

        function V2deleteWorld(id) {
          return $http({
            url: REST_API_URL + 'world/worlds/'+id+'/',
            method: "DELETE"
          })
          .then(function(response) { return response; })
          .catch(function(error) { toastr.error(error); });
        }


        // V1
        function addGamemasterToWorld(user, world) {
            return $http({
                url: REST_API_URL + 'world/userInWorld/',
                method: "POST",
                data: {
                    user: user,
                    world: world
                }
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function removeGamemasterFromWorld(gamemaster, world) {
            return $http({
                url: REST_API_URL + 'world/userInWorld/',
                method: "GET",
                params: {
                    user: gamemaster,
                    world: world
                }
            })
            .then(function(response) {
                $http({
                    url: REST_API_URL + 'world/userInWorld/' + response.data[0].id + '/',
                    method: "DELETE"
                })
                .then(function(response) { return response; })
                .catch(function(error) { toastr.error(error); });
            }, function(error) {
                return error;
            });
        }

        function patchGamemasterWorld(gamemaster, oldWorld, newWorld) {
            return $http({
                url: REST_API_URL + 'world/userInWorld/',
                method: "GET",
                params: {
                    user: gamemaster,
                    world: oldWorld,
                    oldWorldUuid: newWorld
                }
            })
            .then(function(response) {
                return $http({
                    url: REST_API_URL + 'world/userInWorld/' + response.data[0].id + '/',
                    method: "PATCH",
                    data: {
                        world: newWorld.url
                    }
                })
                .then(function(response) { return response; })
                .catch(function(error) { toastr.error(error); });
            }, function(error) {
                return error;
            });
        }

        function getWorldsOfGamemaster(gamemaster) {
            return $http({
                url: REST_API_URL + 'user/userWorlds/'+gamemaster+'/',
                method: "GET"
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

    }

}());
