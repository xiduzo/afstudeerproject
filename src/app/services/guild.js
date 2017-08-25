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
        service.addGuildRule = addGuildRule;
        service.addEndorsement = addEndorsement;
        service.removeEndorsement = removeEndorsement;
        service.patchEndorsement = patchEndorsement;
        service.patchGuildSettings = patchGuildSettings;

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
                url: REST_API_URL + 'guild/newGuild/',
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
              console.log(response);
                $http({
                    url: REST_API_URL + 'guild/userInGuild/' + response.data[0].id,
                    method: "DELETE"
                })
                .then(function(response) { console.log(true, response); return response;
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
                    url: REST_API_URL + 'guild/userInGuild/' + response.data[0].id,
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

        function addGuildRule(guild, rule) {
            return $http({
                url: REST_API_URL + 'guild/guildRules/',
                method: "POST",
                data: {
                    guild: guild,
                    rule: rule.rule,
                    rule_type: rule.rule_type,
                    points: rule.points
                }
            })
            .then(function(response) { return response.data;
            }, function(error) { return error; });
        }

        function addEndorsement(rule, user, endorsed_by, week, rating) {
            return $http({
                url: REST_API_URL + 'guild/newGuildRulesEndorsments/',
                method: "POST",
                data: {
                    rule: rule,
                    user: user,
                    endorsed_by: endorsed_by,
                    week: week,
                    rating: rating,
                }
            })
            .then(function(response) { return response.data;
            }, function(error) { return error; });
        }

        function removeEndorsement(endorsement) {
            return $http({
                url: REST_API_URL + 'guild/guildRulesEndorsments/'+endorsement+'/',
                method: "DELETE"
            })
            .then(function(response) { return response;
            }, function(error) { return error; });
        }

        function patchEndorsement(endorsement, rating) {
            return $http({
                url: REST_API_URL + 'guild/guildRulesEndorsments/'+endorsement+'/',
                method: "PATCH",
                data: {
                    rating: rating,
                }
            })
            .then(function(response) { return response.data;
            }, function(error) { return error; });
        }

        function patchGuildSettings(guild) {
            return $http({
                url: REST_API_URL + 'guild/guilds/' + guild.id + '/',
                method: "PATCH",
                data: {
                    trello_board: guild.trello_board,
                    trello_done_list: guild.trello_done_list
                }
            })
            .then(function(response) { return response.data;
            }, function(error) { return error; });
        }

    }
}());
