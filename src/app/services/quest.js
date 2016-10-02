(function () {
    'use strict';

    angular
        .module('cmd.services')
        .factory('Quest', Quest);

    /** @ngInject */
    function Quest(
        $http,
        $q,
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
        service.patchQuestToggles = patchQuestToggles;
        service.addObjective = addObjective;
        service.removeObjective = removeObjective;
        service.getGuildQuests = getGuildQuests;
        service.getAllGuildQuests = getAllGuildQuests;

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
                    moodle_link: quest.moodle_link,
                    interaction_design: quest.skills.interaction_design,
                    visual_design: quest.skills.visual_design,
                    techniek: quest.skills.techniek,
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

        function patchQuestToggles(quest) {
            return $http({
                url: REST_API_URL + 'quest/quests/'+quest.id+'/',
                method: "PATCH",
                data: {
                    active: quest.active,
                    gradable: quest.gradable,
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
                }
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

        function removeObjective(objective) {
            return $http({
                url: REST_API_URL + 'quest/objectives/'+objective+'/',
                method: "DELETE"
            })
            .then(function(response) {
                return response;
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

        function getAllGuildQuests() {
            return $http({
                url: REST_API_URL + 'guild/guildQuest/',
                method: "GET"
            })
            .then(function(response) {
                return response.data;
            }, function(error) {
                return error;
            });
        }

    }

}());
