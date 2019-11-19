(function() {
  "use strict";

  angular
    .module("cmd.guild")
    .controller("confirmGuildRulesController", confirmGuildRulesController);

  /** @ngInject */
  function confirmGuildRulesController($mdDialog, Global, rules) {
    var self = this;

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    self.close = close;
    self.addRules = addRules;

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    self.rules = rules;
    self.language = Global.getLanguage();

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    function close() {
      $mdDialog.hide();
    }

    function addRules() {
      $mdDialog.hide(true);
    }
  }
})();
