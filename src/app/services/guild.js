(function () {
    'use strict';

    angular
        .module('cmd.services')
        .factory('Guild', Guild);

    /** @ngInject */
    function Guild(
        $http,
        $q,
        Account,
        API_URL,
        REST_API_URL
    ) {

        var service = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        service.getGuilds = getGuilds;
        service.getGuild = getGuild;
        service.addGuild = addGuild;
        service.addUserToGuild = addUserToGuild;
        service.removeUserFromGuild = removeUserFromGuild;
        service.getGuildMembers = getGuildMembers;
        service.patchPlayersGuild = patchPlayersGuild;
        service.patchGuildName = patchGuildName;
        service.deleteGuild = deleteGuild;
        service.getUserGuilds = getUserGuilds;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


        return service;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        // TODO
        // FIX NEW API ROUTE
        function getGuilds(world) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'get/guilds.php',
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

        function getGuild(guild) {
            return $http({
                url: REST_API_URL + 'guild/guilds/'+guild+'/',
                method: "GET"
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function addGuild(name, world) {
            return $http({
                url: REST_API_URL + 'guild/guilds/',
                method: "POST",
                data: {
                    name: name,
                    world: world
                }
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function addUserToGuild(user, guild) {
            return $http({
                url: REST_API_URL + 'guild/userInGuild/',
                method: "POST",
                data: {
                    user: user,
                    guild: guild
                }
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function removeUserFromGuild(user, guild) {
            return $http({
                url: REST_API_URL + 'guild/userInGuild',
                method: "GET",
                params: {
                    user: user,
                    guild: guild
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

        // TODO
        // FIX NEW API ROUTE
        function getGuildMembers(guild) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'get/guild_members.php',
                    method: "GET",
                    params: {
                        guildUuid: guild
                    }
                })
                .then(function(response) {
                    resolve(response.data);
                }, function(error) {
                    reject(error);
                });
            });
        }

        function patchPlayersGuild(user, oldGuild, newGuild) {
            return $http({
                url: REST_API_URL + 'guild/userInGuild/',
                method: "GET",
                params: {
                    user: user,
                    guild: oldGuild
                }
            })
            .then(function(response) {
                return $http({
                    url: response.data[0].url,
                    method: "PATCH",
                    data: {
                        guild: newGuild.url
                    }
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

        function patchGuildName(name, guild) {
            return $http({
                url: REST_API_URL + 'guild/guilds/'+guild+'/',
                method: "PATCH",
                data: {
                    name: name,
                }
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function deleteGuild(guild) {
            return $http({
                url: REST_API_URL + 'guild/guilds/'+guild+'/',
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
        function getUserGuilds(user) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'get/user_guilds.php',
                    method: "GET",
                    params: {
                        userUid: user
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
