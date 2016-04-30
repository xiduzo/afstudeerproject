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
        service.addGuild = addGuild;
        service.getUsersWithoutGuild = getUsersWithoutGuild;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


        return service;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function getGuilds() {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'get/guilds.php',
                    method: "GET"
                })
                .then(function(response) {
                    resolve(response.data);
                }, function(error) {
                    reject(error);
                });
            });
        }

        function addGuild(name) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'insert/guild.php',
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

        function getUsersWithoutGuild() {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'get/users_without_world.php',
                    method: "GET"
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
