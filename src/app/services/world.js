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
        service.changeWorldName = changeWorldName;

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
                    url: API_URL + 'inserts/world.php',
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

        function getWorlds() {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'gets/worlds.php',
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

    }

}());
