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

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


        return service;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
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

        function patchPlayersGuild(user, guild) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'patch/user_guild.php',
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
    }

}());
