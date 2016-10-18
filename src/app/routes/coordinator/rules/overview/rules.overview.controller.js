(function () {
    'use strict';

    angular
        .module('cmd.base')
        .controller('RulesOverviewController', RulesOverviewController);

    /** @ngInject */
    function RulesOverviewController(
        $mdDialog,
        Global,
        Rules,
        Notifications,
        LECTURER_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < LECTURER_ACCESS_LEVEL) {
            Global.notAllowed();
            return;
        }

        Global.setRouteTitle('Rules');
        Global.setRouteBackRoute(null);

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.addRule = addRule;
        self.deleteRule = deleteRule;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.access = Global.getAccess();
        self.rules = [];

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Rules.getRules()
        .then(function(rules) {
            self.rules = rules;
            console.log(self.rules);
        })
        .catch(function(error) {
            console.log(error);
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function addRule() {
            $mdDialog.show({
                controller: 'addRuleController',
                controllerAs: 'addRuleCtrl',
                templateUrl: 'app/routes/coordinator/rules/overview/rules/rules.html',
                targetEvent: event,
                clickOutsideToClose: true,
                locals: {
                    title: 'Add rule',
                    about: 'rule',
                }
            })
            .then(function(response) {
                if(!response ||
                    !response.rule ||
                    !response.rule_type ||
                    !response.importance) {
                    return Notifications.simpleToast('Fill in all the fields to add an rule');
                }

                if(response.importance >= 95) {
                    response.points = 13;
                } else if (response.importance > 70) {
                    response.points = 8;
                } else if (response.importance > 40) {
                    response.points = 5;
                } else if (response.importance > 20) {
                    response.points = 3;
                } else if (response.importance > 10) {
                    response.points = 2;
                } else {
                    response.points = 1;
                }

                console.log(response);

                // Add rule to the system
                Rules.addRule(response)
                .then(function(response) {
                    Notifications.simpleToast('Rule \''+response.rule+'\' added');
                    self.rules.push(response);
                })
                .catch(function(error) {
                    // err add rule
                });


            }, function() {
                // Err dialog
            });
        }

        function deleteRule(rule) {
            Rules.deleteRule(rule.id)
            .then(function(response) {
                self.rules.splice(_.indexOf(self.rules, rule), 1);
                Notifications.simpleToast('Rule got removed');
            })
            .catch(function(error) {
                console.log(error);
            });
        }


    }
}());
