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
            return Global.notAllowed();
        }

        Global.setRouteTitle('Rules');
        Global.setRouteBackRoute(null);

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.addRule = addRule;
        self.deleteRule = deleteRule;
        self.loading_page = true;

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
            self.loading_page = false;
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

                // Add rule to the system
                Rules.addRule(response)
                .then(function(response) {
                    Notifications.simpleToast('Rule \''+response.rule+'\' added');
                    self.rules.push(response);
                })
                .catch(function(error) {
                    console.log(error);
                });


            }, function() {
                // Err dialog
            });
        }

        function deleteRule(rule) {
            if(Global.getLocalSettings().enabled_confirmation) {
                Notifications.confirmation(
                    'Are you sure you want to delete this rule?',
                    'Please consider your answer, this action can not be undone.',
                    'Delete rule',
                    event
                )
                .then(function() {
                    removeRuleFromBackend(rule);
                }, function() {
                    // No
                });
            } else {
                removeRuleFromBackend(rule);
            }
        }

        function removeRuleFromBackend(rule) {
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
