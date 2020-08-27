(function () {
  'use strict';

  angular
    .module('cmd.home')
    .controller('CoordinatorDashboardController', CoordinatorDashboardController);

  /** @ngInject */
  function CoordinatorDashboardController(Global, Account) {
    Global.setRouteTitle('Dashboard');

    var vm = this;

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    vm.patchAccessLevel = patchAccessLevel;

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    vm.user = Global.getUser();

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    Account.getLecturers()
      .then(function (response) {
        vm.lecturers = response;
      })
      .catch(function (error) {
        //console.log(error);
      });

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    function patchAccessLevel(user) {
      Account.patchUser(user)
        .then(function (response) {
          //console.log(response);
        })
        .catch(function (error) {
          //console.log(error);
        });
    }
  }
})();
