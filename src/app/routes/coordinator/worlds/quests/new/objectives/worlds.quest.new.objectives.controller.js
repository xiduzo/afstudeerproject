(function () {
    'use strict';

    angular
        .module('cmd.worlds')
        .controller('addQuestObjectiveController', addQuestObjectiveController);

    /** @ngInject */
    function addQuestObjectiveController(
        $mdDialog,
        title,
        about
    ) {

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.close = close;
        self.addObjective = addObjective;


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.title = title;
        self.about = about;
        self.formInput = {
            name: '',
            objective: '',
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

        function addObjective() {
            $mdDialog.hide(self.formInput);
        }


    }

}());
