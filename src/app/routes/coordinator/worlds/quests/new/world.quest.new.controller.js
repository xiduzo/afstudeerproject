(function () {
    'use strict';

    angular
        .module('cmd.worlds')
        .controller('WorldsQuestsNewController', WorldsQuestsNewController);

    /** @ngInject */
    function WorldsQuestsNewController(
        $mdDialog,
        $mdToast,
        $state,
        $stateParams,
        CMDChart,
        Global,
        Notifications,
        Quest,
        Spiderchart,
        World,
        COORDINATOR_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < COORDINATOR_ACCESS_LEVEL) {
            Global.notAllowed();
            return;
        }

        Global.setRouteTitle('New assessment');
        Global.setRouteBackRoute('base.worlds.settings', {worldUuid: $stateParams.worldUuid});

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.updateChart = updateChart;
        self.addQuest = addQuest;
        self.addObjective = addObjective;
        self.removeObjective = removeObjective;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.worldUuid = $stateParams.worldUuid;
        self.world = [];
        self.formInput = {
            name: '',
            description: '',
            moodle: '',
            experience: null
        };
        self.skills = {
            interaction: 0,
            visual: 0,
            techniek: 0
        };
        self.objectives = [];

        CMDChart.createChart('cmd__profile', self.skills, 'small');

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        World.getWorld($stateParams.worldUuid)
            .then(function(response) {
                self.world = response;
                Global.setRouteTitle('New assessment', self.world.name);
            }, function() {
                // Err
            });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function updateChart() {
            CMDChart.createChart('cmd__profile', self.skills, 'small');
        }

        function addQuest() {
            var quest = {
                name:        self.formInput.name,
                experience:  self.formInput.experience,
                description: self.formInput.description,
                moodle_link: self.formInput.moodle,
                skills: {
                    interaction_design: self.skills.interaction,
                    visual_design:      self.skills.visual,
                    techniek:           self.skills.techniek
                }
            };

            Quest.addQuest(quest, self.world.url)
                .then(function(response) {

                    // Add all the objectives
                    _.each(self.objectives, function(objective) {
                        Quest.addObjective(response.url, objective);
                    });

                    Notifications.simpleToast('Assignment ' + response.name + ' added to ' + self.world.name);
                    $state.go('base.worlds.settings', {"worldUuid" : self.world.id});
                }, function() {
                    // Err
                });
        }

        function addObjective() {
            $mdDialog.show({
                controller: 'addQuestObjectiveController',
                controllerAs: 'addQuestObjectiveCtrl',
                templateUrl: 'app/routes/coordinator/worlds/quests/new/objectives/objectives.html',
                targetEvent: event,
                clickOutsideToClose: true,
                locals: {
                    title: 'Add objective to ' + self.formInput.name,
                    about: 'Assignment objective',
                }
            })
            .then(function(response) {
                if(!response || !response.name || !response.objective) {
                    return Notifications.simpleToast('Please fill in all the fields');
                }

                response.editing = false;
                self.objectives.push(response);

            }, function() {
                // Err
            });
        }

        function removeObjective(objective) {
            self.objectives.splice(self.objectives.indexOf(objective), 1);
        }

    }

}());
