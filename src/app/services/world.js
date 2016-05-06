(function () {
    'use strict';

    angular
        .module('cmd.services')
        .factory('World', World);

    /** @ngInject */
    function World(
        $http,
        $q,
        API_URL
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
        service.getGamemasters = getGamemasters;
        service.removeGamemasterFromWorld = removeGamemasterFromWorld;
        service.patchGamemasterWorld = patchGamemasterWorld;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


        return service;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function addWorld(name) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'insert/world.php',
                    method: "GET",
                    params: {
                        name: name
                    }
                })
                .then(function(response) {
                    resolve(response.data);
                }, function(error) {
                    reject(error);
                });
            });
        }

        function getWorld(uuid) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'get/world.php',
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

        function getWorlds() {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'get/worlds.php',
                    method: "GET"
                })
                .then(function(response) {
                    resolve(response.data);
                }, function(error) {
                    reject(error);
                });
            });
        }

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

        function getGamemasters(world) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'get/gamemasters.php',
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

        function patchGamemasterWorld(gamemaster, world) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'patch/user_world.php',
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

    }

}());
