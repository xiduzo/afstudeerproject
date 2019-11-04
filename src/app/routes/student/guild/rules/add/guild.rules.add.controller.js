;(function() {
  'use strict'

  angular.module('cmd.guild').controller('addGuildRuleController', addGuildRuleController)

  /** @ngInject */
  function addGuildRuleController($mdDialog) {
    var self = this

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    self.close = close
    self.addRule = addRule

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    self.formInput = {
      type: undefined,
      rule: undefined,
    }

    self.types = [
      { type: 1, name: 'ATTITUDE', icon: 'work_dark' },
      { type: 2, name: 'FUNCTIONING_IN_TEAM', icon: 'group_work_dark' },
      { type: 3, name: 'KNOWLEDGE_DEVELOPMENT', icon: 'lightbulb_dark' },
      { type: 4, name: 'ACCOUNTABILITY', icon: 'description_dark' },
    ]

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    function close() {
      $mdDialog.hide()
    }

    function addRule() {
      $mdDialog.hide(self.formInput)
    }
  }
})()
