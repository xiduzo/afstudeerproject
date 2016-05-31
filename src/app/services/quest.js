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
        service.deleteQuest = deleteQuest;
        service.getQuest = getQuest;
        service.patchQuest = patchQuest;
        service.toggleQuest = toggleQuest; // Active / inactive.. Naming should be better ಠ▃ಠ

        return service;


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        // TODO
        // FIX NEW API ROUTE
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

        // TODO
        // FIX NEW API ROUTE
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

        // TODO
        // FIX NEW API ROUTE
        function deleteQuest(quest, world) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'delete/quest.php',
                    method: "GET",
                    params: {
                        questUuid: quest,
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
        function getQuest(quest) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'get/quest.php',
                    method: "GET",
                    params: {
                        questUuid: quest
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
        function patchQuest(quest, world) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'patch/quest.php',
                    method: "GET",
                    params: {
                        questUuid: quest.uuid,
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

        // TODO
        // FIX NEW API ROUTE
        function toggleQuest(quest, world, status) {
            return $q(function(resolve, reject) {
                $http({
                    url: API_URL + 'patch/questStatus.php',
                    method: "GET",
                    params: {
                        questUuid: quest,
                        worldUuid: world,
                        active: status ? 1 : 0
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
