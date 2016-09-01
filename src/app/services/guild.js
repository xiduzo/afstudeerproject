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
        service.getGuild = getGuild;
        service.addGuild = addGuild;
        service.addUserToGuild = addUserToGuild;
        service.removeUserFromGuild = removeUserFromGuild;
        service.patchPlayersGuild = patchPlayersGuild;
        service.patchGuildName = patchGuildName;
        service.deleteGuild = deleteGuild;
        service.getUserGuilds = getUserGuilds;
        service.getQuests = getQuests;
        service.addQuest = addQuest;
        service.addObjective = addObjective;
        service.removeObjective = removeObjective;
        service.patchObjective = patchObjective;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


        return service;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function getGuild(guild) {
            return $http({
                url: REST_API_URL + 'guild/guilds/'+guild+'/',
                method: "GET"
            })
            .then(function(response) { return response.data;
            }, function(error) { return error; });
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
            .then(function(response) { return response.data;
            }, function(error) { return error; });
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
            .then(function(response) { return response.data;
            }, function(error) { return error; });
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
                .then(function(response) { return response;
                }, function(error) { return error; });
            }, function(error) { return error; });
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
                .then(function(response) { return response;
                }, function(error) { return error; });
            }, function(error) { return error; });
        }

        function patchGuildName(name, guild) {
            return $http({
                url: REST_API_URL + 'guild/guilds/'+guild+'/',
                method: "PATCH",
                data: {
                    name: name,
                }
            })
            .then(function(response) { return response.data;
            }, function(error) { return error; });
        }

        function deleteGuild(guild) {
            return $http({
                url: REST_API_URL + 'guild/guilds/'+guild+'/',
                method: "DELETE"
            })
            .then(function(response) { return response.data;
            }, function(error) { return error; });
        }

        function getUserGuilds(user) {
            return $http({
                url: REST_API_URL + 'user/userGuilds/'+user+'/',
                method: "GET"
            })
            .then(function(response) { return response.data;
            }, function(error) { return error; });
        }

        function getQuests(guild) {
            return $http({
                url: REST_API_URL + 'guild/guildQuest/',
                method: "GET",
                params: {
                    guild: guild
                }
            })
            .then(function(response) { return response.data;
            }, function(error) { return error; });
        }

        function addQuest(guild, quest) {
            return $http({
                url: REST_API_URL + 'guild/guildQuest/',
                method: "POST",
                data: {
                    guild: guild,
                    quest: quest
                }
            })
            .then(function(response) { return response.data;
            }, function(error) { return error; });
        }

        function addObjective(guild, objective) {
            return $http({
                url: REST_API_URL + 'guild/guildObjective/',
                method: "POST",
                data: {
                    guild: guild,
                    name: objective.name,
                    objective: objective.objective,
                    points: objective.points
                }
            })
            .then(function(response) { return response.data;
            }, function(error) { return error; });
        }

        function removeObjective(objective) {
            return $http({
                url: REST_API_URL + 'guild/guildObjective/'+objective+'/',
                method: "DELETE"
            })
            .then(function(response) { return response;
            }, function(error) { return error; });
        }

        function patchObjective(objective) {
            return $http({
                url: REST_API_URL + 'guild/guildObjective/'+objective.id+'/',
                method: "PATCH",
                data:  {
                    completed: !objective.completed,
                    completed_at: !objective.completed ? moment().format() : null
                }
            })
            .then(function(response) { return response.data;
            }, function(error) { return error; });
        }
    }

}());
