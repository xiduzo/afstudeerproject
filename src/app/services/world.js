(function () {
    'use strict';

    angular
        .module('cmd.services')
        .factory('World', World);

    /** @ngInject */
    function World(
        $http,
        $q,
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
        service.addGamemasterToWorld = addGamemasterToWorld;
        service.removeGamemasterFromWorld = removeGamemasterFromWorld;
        service.patchGamemasterWorld = patchGamemasterWorld;
        service.getWorldsOfGamemaster = getWorldsOfGamemaster;
        service.addRule = addRule;
        service.removeRule = removeRule;
        service.patchWorldSettings = patchWorldSettings;

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

        function getWorld(id) {
            return $http({
                url: REST_API_URL + 'world/worlds/'+id+'/',
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

        function changeWorldName(name, id) {
            return $http({
                url: REST_API_URL + 'world/worlds/'+id+'/',
                method: "PATCH",
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
                        world: newWorld.url
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

        function addRule(world, ruleObject) {
            return $http({
                url: REST_API_URL + 'world/worldRule/',
                method: "POST",
                data: {
                    world: world,
                    rule: ruleObject.rule,
                    points: ruleObject.points,
                    rule_type: ruleObject.rule_type
                }
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function removeRule(rule) {
            return $http({
                url: REST_API_URL + 'world/worldRule/' + rule + '/',
                method: "DELETE"
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function patchWorldSettings(world) {
            return $http({
                url: REST_API_URL + 'world/worlds/' + world.id + '/',
                method: "PATCH",
                data: {
                    start: world.start,
                    course_duration: world.course_duration
                }
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

    }

}());
