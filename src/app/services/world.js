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
        service.getTotalExperience = getTotalExperience;

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

        // TODO
        // FIX NEW API ROUTE
        function changeWorldName(name, uuid) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'patch/world_name.php',
                    method: "GET",
                    params: {
                        name: name,
                        uuid: uuid
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
        function deleteWorld(uuid) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'delete/world.php',
                    method: "GET",
                    params: {
                        uuid: uuid
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

        // TODO
        // FIX NEW API ROUTE
        function removeGamemasterFromWorld(gamemaster, world) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'delete/gamemaster_from_world.php',
                    method: "GET",
                    params: {
                        userUid: gamemaster,
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
        function patchGamemasterWorld(gamemaster, oldWorld, world) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'patch/user_world.php',
                    method: "GET",
                    params: {
                        userUid: gamemaster,
                        worldUuid: world,
                        oldWorldUuid: oldWorld
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

        // TODO
        // FIX NEW API ROUTE
        function getTotalExperience(world) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'get/world_total_experience.php',
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

    }

}());
