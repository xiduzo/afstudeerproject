(function () {
    'use strict';

    angular
        .module('cmd.home')
        .controller('HomeController', HomeController);

    /** @ngInject */
    function HomeController($scope) {

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = $scope.Global.data.user.data;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    }

}());
