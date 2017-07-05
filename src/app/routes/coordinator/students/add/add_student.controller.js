(function () {
  'use strict';

  angular
  .module('cmd.students')
  .controller('addStudentController', addStudentController);

  /** @ngInject */
  function addStudentController(
    $mdDialog
  ) {

    var self = this;

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Methods
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    self.close = close;
    self.addStudents = addStudents;

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Variables
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    self.students = "";

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Services
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Method Declarations
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    function close() {
      $mdDialog.hide();
    }

    function addStudents() {
      $mdDialog.hide(self.students);
    }


  }

}());
