(function() {
  'use strict';

  angular.module('cmd.home').controller('RulesOverviewController', RulesOverviewController);

  /** @ngInject */
  function RulesOverviewController(
    $mdDialog,
    $translate,
    Global,
    Rules,
    Notifications,
    toastr,
    LECTURER_ACCESS_LEVEL
  ) {
    if (Global.getAccess() < LECTURER_ACCESS_LEVEL) {
      return Global.notAllowed();
    }

    Global.setRouteTitle($translate.instant('JS_AGREEMENTS'));
    Global.setRouteBackRoute(null);

    var self = this;

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    self.addRule = addRule;
    self.deleteRule = deleteRule;
    self.patchRule = patchRule;

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    self.user = Global.getUser();
    self.access = Global.getAccess();
    self.rules = [];
    self.loading_page = true;

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    Rules.getRules()
      .then(function(rules) {
        self.rules = rules;
        self.loading_page = false;
      })
      .catch(function(error) {
        //console.log(error);
      });

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    function addRule() {
      $mdDialog
        .show({
          controller: 'addRuleController',
          controllerAs: 'addRuleCtrl',
          templateUrl: 'app/routes/coordinator/rules/overview/rules/rules.html',
          targetEvent: event,
          clickOutsideToClose: true,
          locals: {
            title: $translate.instant('STUDENT_RULES_ADD_AGREEMENT'),
            about: $translate.instant('STUDENT_RULES_ADD_AGREEMENT'),
            formInput: {
              rule_type: null,
              rule: null,
              importance: null,
            },
          },
        })
        .then(
          function(response) {
            if (!response || !response.rule || !response.rule_type || !response.importance) {
              return toastr.warning($translate.instant('JS_FILL_IN_ALL_FIELDS'));
            }

            if (response.importance >= 95) {
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
                toastr.success(
                  $translate.instant('JS_AGREEMENT') +
                    ' ' +
                    response.rule +
                    ' ' +
                    $translate.instant('JS_ADDED')
                );
                self.rules.push(response);
              })
              .catch(function(error) {
                //console.log(error);
              });
          },
          function() {
            // Err dialog
          }
        );
    }

    function deleteRule(rule) {
      if (Global.getLocalSettings().enabled_confirmation) {
        Notifications.confirmation(
          $translate.instant('JS_ARE_YOU_SURE_DELETE_RULE'),
          $translate.instant('JS_CAN_NOT_BE_UNDONE'),
          $translate.instant('JS_REMOVE_AGREEMENT'),
          event
        ).then(
          function() {
            removeRuleFromBackend(rule);
          },
          function() {
            // No
          }
        );
      } else {
        removeRuleFromBackend(rule);
      }
    }

    function removeRuleFromBackend(rule) {
      Rules.deleteRule(rule.id)
        .then(function(response) {
          self.rules.splice(_.indexOf(self.rules, rule), 1);
          toastr.success($translate.instant('JS_AGREEMENT_REMOVED'));
        })
        .catch(function(error) {
          //console.log(error);
        });
    }

    function patchRule(rule) {
      // Reverse engineering
      if (rule.points === 13) {
        rule.importance = 96;
      } else if (rule.points === 8) {
        rule.importance = 71;
      } else if (rule.points === 5) {
        rule.importance = 41;
      } else if (rule.points === 3) {
        rule.importance = 21;
      } else if (rule.points === 2) {
        rule.importance = 11;
      } else {
        rule.importance = 5;
      }
      $mdDialog
        .show({
          controller: 'addRuleController',
          controllerAs: 'addRuleCtrl',
          templateUrl: 'app/routes/coordinator/rules/overview/rules/rules.html',
          targetEvent: event,
          clickOutsideToClose: true,
          locals: {
            title: $translate.instant('JS_CHANGE_RULE'),
            about: $translate.instant('JS_CHANGE_RULE'),
            formInput: {
              rule_type: rule.rule_type,
              rule: rule.rule,
              importance: rule.importance,
            },
          },
        })
        .then(function(response) {
          if (!response || !response.rule || !response.rule_type || !response.importance) {
            return toastr.warning($translate.instant('JS_FILL_IN_ALL_FIELDS'));
          }

          if (response.importance >= 95) {
            rule.points = 13;
          } else if (response.importance > 70) {
            rule.points = 8;
          } else if (response.importance > 40) {
            rule.points = 5;
          } else if (response.importance > 20) {
            rule.points = 3;
          } else if (response.importance > 10) {
            rule.points = 2;
          } else {
            rule.points = 1;
          }

          rule.rule_type = response.rule_type;
          rule.rule = response.rule;

          // Add rule to the system
          Rules.patchRule(rule)
            .then(function(response) {
              toastr.success(
                $translate.instant('JS_AGREEMENT') +
                  ' ' +
                  response.rule +
                  ' ' +
                  $translate.instant('JS_CHANGED')
              );
            })
            .catch(function(error) {
              //console.log(error);
            });
        })
        .catch(function(response) {
          //console.log(error);
        });
    }
  }
})();
