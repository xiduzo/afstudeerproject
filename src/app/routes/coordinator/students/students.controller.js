(function () {
  'use strict';

  angular
    .module('cmd.students')
    .controller('StudentsController', StudentsController);

  /** @ngInject */
  function StudentsController(
    $filter,
    $mdDialog,
    Global,
    Account,
    Notifications,
    toastr,
    LECTURER_ACCESS_LEVEL
  ) {

      if(Global.getAccess() < LECTURER_ACCESS_LEVEL) {
        return Global.notAllowed();
      }

      Global.setRouteTitle('Studenten');
      Global.setRouteBackRoute(null);

      var self = this;

      /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	      Methods
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
      self.addStudents = addStudents;

      /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          Variables
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
      self.user = Global.getUser();
      self.access = Global.getAccess();
      self.loading_page = true;

      /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	      Services
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
      Account.getStudents()
      .then(function(response){
        _.each(response, function(student) {
          student.filter_name = $filter('fullUserName')(student);
        });
        self.students = response;
        self.loading_page = false;
      })
      .catch(function(error) {
        console.log(error);
      });

      /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	      Method Declarations
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
      function addStudents() {
        $mdDialog.show({
            controller: 'addStudentController',
            controllerAs: 'addStudentCtrl',
            templateUrl: 'app/routes/coordinator/students/add/add_student.html',
            targetEvent: event,
            clickOutsideToClose: true,
        })
        .then(function(response) {
          if(!response) {
            return toastr.warning("Empty field");
          }
          if(response.charAt(0) != '[' || response.charAt(response.length -1) != ']') {
            return toastr.warning("Make sure to provide a valid array.");
          }

          try {
            JSON.parse(response)
          } catch(e) {
            return toastr.console.warn();("I'm just a stupid machine, please provide me with valid JSON.");
          }

          var students = JSON.parse(response);

          _.each(students, function(student) {
            Account.createUser(student)
            .then(function(response) {
              toastr.success("Student " + student.first_name + " toegevoegd.");
              response.filter_name = $filter('fullUserName')(response);
              self.students.push(response)
            })
            .catch(function(){
              // Error
            });
          });
        }, function() {
            // Err dialog
        });
      }


  }
}());
