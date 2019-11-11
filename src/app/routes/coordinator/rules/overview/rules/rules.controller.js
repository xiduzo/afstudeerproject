(function() {
  'use strict';

  angular.module('cmd.worlds').controller('addRuleController', addRuleController);

  /** @ngInject */
  function addRuleController($mdDialog, $translate, title, about, formInput) {
    var self = this;

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    self.close = close;
    self.addRule = addRule;

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    self.title = title;
    self.about = about;
    self.formInput = formInput;

    self.types = [
      { type: 1, name: $translate.instant('ATTITUDE'), icon: 'work_dark' },
      { type: 2, name: $translate.instant('FUNCTIONING_IN_TEAM'), icon: 'group_work_dark' },
      { type: 3, name: $translate.instant('KNOWLEDGE_DEVELOPMENT'), icon: 'lightbulb_dark' },
      { type: 4, name: $translate.instant('ACCOUNTABILITY'), icon: 'description_dark' },
    ];

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    function close() {
      $mdDialog.hide();
    }

    function addRule() {
      $mdDialog.hide(self.formInput);
    }
  }
})();
