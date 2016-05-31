(function () {
    'use strict';

    angular
        .module('cmd.services')
        .factory('World', World);

    /** @ngInject */
    function World(
        $http,
        $q,
        API_URL,
        REST_API_URL
    ) {

        var service = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        service.addWorld = addWorld;
        service.getWorlds = getWorlds;
        service.getWorld = getWorld;
        service.changeWorldName = changeWorldName;
        service.deleteWorld = deleteWorld;
        service.getLecturers = getLecturers;
        service.addGamemasterToWorld = addGamemasterToWorld;
        service.removeGamemasterFromWorld = removeGamemasterFromWorld;
        service.patchGamemasterWorld = patchGamemasterWorld;
        service.getWorldsOfGamemaster = getWorldsOfGamemaster;

        return service;
        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function addWorld(name) {
            return $http({
                url: REST_API_URL + 'world/worlds/',
                method: "POST",
                data: {
                    name: name
                }
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function getWorld(uuid) {
            return $http({
                url: REST_API_URL + 'world/worlds/'+uuid,
                method: "GET"
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function getWorlds() {
            return $http({
                url: REST_API_URL + 'world/worlds/',
                method: "GET"
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function changeWorldName(name, uuid) {
            return $http({
                url: REST_API_URL + 'world/worlds/'+uuid+'/',
                method: "PUT",
                data: {
                    name: name
                }
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function deleteWorld(uuid) {
            return $http({
                    url: REST_API_URL + 'world/worlds/'+uuid+'/',
                    method: "DELETE"
                })
                .then(function(response) {
                    return response.data;
                }, function(error) {
                    return error;
                });
        }

        // TODO
        // FIX NEW API ROUTE
        function getLecturers(world) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'get/lecturers.php',
                    method: "GET",
                    params: {
                        worldUuid: world
                    }
                })
                .then(function(response) {
                    resolve(response.data);
                }, function(error) {
                    reject(error);
                });
            });
        }

        // TODO
        // FIX NEW API ROUTE
        function addGamemasterToWorld(user, world) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'insert/gamemaster_in_world.php',
                    method: "GET",
                    params: {
                        userUid:   user,
                        worldUuid: world
                    }
                })
                .then(function(response) {
                    resolve(response.data);
                }, function(error) {
                    reject(error);
                });
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
                    url: response.data[0].url,
                    method: "DELETE"
                })
                .then(function(response) {
                    return response;
                }, function(error) {
                    return error;
                });
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
                    url: response.data[0].url,
                    method: "PATCH",
                    data: {
                        world: newWorld.id
                    }
                })
                .then(function(response) {
                    return response;
                }, function(error) {
                    return error;
                });
                // return response.data;
            }, function(error) {
                return error;
            });
        }

        // TODO
        // FIX NEW API ROUTE
        function getWorldsOfGamemaster(gamemaster) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'get/worlds_of_gamemaster.php',
                    method: "GET",
                    params: {
                        userUid: gamemaster
                    }
                })
                .then(function(response) {
                    resolve(response.data);
                }, function(error) {
                    reject(error);
                });
            });
        }

    }

}());
