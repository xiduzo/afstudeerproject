(function () {
    'use strict';

    angular
        .module('cmd.services')
        .factory('Quest', Quest);

    /** @ngInject */
    function Quest(
        $http,
        $q,
        API_URL,
        REST_API_URL
    ) {

        var service = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        service.addQuest = addQuest;
        service.deleteQuest = deleteQuest;
        service.getQuest = getQuest;
        service.patchQuest = patchQuest;
        service.toggleQuest = toggleQuest; // Active / inactive.. Naming should be better ಠ▃ಠ
        service.addObjective = addObjective;
        service.getGuildQuests = getGuildQuests;

        return service;


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function addQuest(quest, world) {
            return $http({
                url: REST_API_URL + 'quest/quests/',
                method: "POST",
                data: {
                    name: quest.name,
                    description: quest.description,
                    experience: quest.experience,
                    interaction_design: quest.skills.interaction_design,
                    visual_interface_design: quest.skills.visual_interface_design,
                    frontend_development: quest.skills.frontend_development,
                    content_management: quest.skills.content_management,
                    project_management: quest.skills.project_management,
                    world: world
                }
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function deleteQuest(quest) {
            return $http({
                url: REST_API_URL + 'quest/quests/'+quest+'/',
                method: "DELETE"
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function getQuest(quest) {
            return $http({
                url: REST_API_URL + 'quest/quests/'+quest+'/',
                method: "GET"
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function patchQuest(quest) {
            return $http({
                url: REST_API_URL + 'quest/quests/'+quest.id+'/',
                method: "PATCH",
                data: {
                    name: quest.name,
                    description: quest.description,
                    experience: quest.experience,
                    interaction_design: quest.skills.interaction_design,
                    visual_interface_design: quest.skills.visual_interface_design,
                    frontend_development: quest.skills.frontend_development,
                    content_management: quest.skills.content_management,
                    project_management: quest.skills.project_management
                }
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function toggleQuest(quest, status) {
            return $http({
                url: REST_API_URL + 'quest/quests/'+quest+'/',
                method: "PATCH",
                data: {
                    active: status
                }
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function addObjective(quest, objective) {
            return $http({
                url: REST_API_URL + 'quest/objectives/',
                method: "POST",
                data: {
                    quest: quest,
                    name: objective.name,
                    objective: objective.objective,
                    points: objective.points
                }
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function getGuildQuests(quest) {
            return $http({
                url: REST_API_URL + 'guild/guildQuest/',
                method: "GET",
                params: {
                    quest: quest
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
