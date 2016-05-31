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
        API_URL
    ) {

        var service = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        service.getGuilds = getGuilds;
        service.getGuild = getGuild;
        service.addGuild = addGuild;
        service.getUsersWithoutGuild = getUsersWithoutGuild;
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

        // TODO
        // FIX NEW API ROUTE
        function getGuild(guild) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'get/guild.php',
                    method: "GET",
                    params: {
                        uuid: guild
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
        function addGuild(name, world) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'insert/guild.php',
                    method: "GET",
                    params: {
                        name: name,
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
        function getUsersWithoutGuild(world) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'get/users_without_guild.php',
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
        function addUserToGuild(user, guild) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'insert/user_in_guild.php',
                    method: "GET",
                    params: {
                        userUid: user,
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

        // TODO
        // FIX NEW API ROUTE
        function removeUserFromGuild(user, guild) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'delete/user_from_guild.php',
                    method: "GET",
                    params: {
                        userUid: user,
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

        // TODO
        // FIX NEW API ROUTE
        function patchPlayersGuild(user, oldGuild, guild) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'patch/user_guild.php',
                    method: "GET",
                    params: {
                        userUid: user,
                        oldGuildUuid: oldGuild,
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

        // TODO
        // FIX NEW API ROUTE
        function patchGuildName(name, guild) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'patch/guild_name.php',
                    method: "GET",
                    params: {
                        name: name,
                        uuid: guild
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
        function deleteGuild(guild) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'delete/guild.php',
                    method: "GET",
                    params: {
                        uuid: guild
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
