(function () {
    'use strict';

    angular
        .module('cmd.home')
        .controller('HomeController', HomeController);

    /** @ngInject */
    function HomeController($scope, Account) {

        var self = this;


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = $scope.Global.getUser();

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    }

}());
