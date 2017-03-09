(function () {
    'use strict';

    angular
        .module('cmd.worlds')
        .controller('addTaskController', addTaskController);

    /** @ngInject */
    function addTaskController(
        $mdDialog,
        title,
        about
    ) {

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.close = close;
        self.addTask = addTask;


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.title = title;
        self.about = about;
        self.formInput = {
            name: '',
            objective: '',
            points: ''
        };

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function close() {
            $mdDialog.hide();
        }

        function addTask() {
            $mdDialog.hide(self.formInput);
        }


    }

}());
