(function () {
    'use strict';

    angular
        .module('cmd.services')
        .factory('Quest', Quest);

    /** @ngInject */
    function Quest(
        $http,
        $q,
        API_URL
    ) {

        var service = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        service.addQuest = addQuest;
        service.getQuests = getQuests;

        return service;


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function addQuest(quest, world) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'insert/quest.php',
                    method: "GET",
                    params: {
                        name: quest.name,
                        experience: quest.experience,
                        description: quest.description,
                        id: quest.skills.interaction_design,
                        vid: quest.skills.visual_interface_design,
                        fd: quest.skills.frontend_development,
                        cm: quest.skills.content_management,
                        pm: quest.skills.project_management,
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

        function getQuests(world) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'get/quests.php',
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
