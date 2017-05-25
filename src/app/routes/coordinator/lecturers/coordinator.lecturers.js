(function () {
  'use strict';

  angular
    .module('cmd.lecturers')
    .controller('LecturersController', LecturersController);

  /** @ngInject */
  function LecturersController(
    $filter,
    Global,
    Account,
    Notifications,
    LECTURER_ACCESS_LEVEL
  ) {

      if(Global.getAccess() < LECTURER_ACCESS_LEVEL) {
        return Global.notAllowed();
      }

      Global.setRouteTitle('Lecturers');
      Global.setRouteBackRoute(null);

      var self = this;

      /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	      Methods
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
      self.patchAccessLevel = patchAccessLevel;

      /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          Variables
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
      self.user = Global.getUser();
      self.access = Global.getAccess();
      self.loading_page = true;

      /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	      Services
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
      Account.getLecturers()
      .then(function(response){
        _.each(response, function(lecturer) {
          lecturer.filter_name = $filter('fullUserName')(lecturer);
        });
        self.lecturers = response;
        self.loading_page = false;
      })
      .catch(function(error) {
        console.log(error);
      });

      /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	      Method Declarations
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
      function patchAccessLevel(user) {
        Account.patchUser(user).
        then(function(response) {
          Notifications.simpleToast(user.filter_name + ' is ' + (response.is_superuser ? 'a' : 'no') + ' coordinator ' + (response.is_superuser ? 'now' : ' anymore'));
        })
        .catch(function(error) {
          console.log(error);
        });
      }


  }
}());
