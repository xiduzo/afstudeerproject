(function () {
    'use strict';

    angular
        .module('cmd.worlds')
        .controller('addRuleController', addRuleController);

    /** @ngInject */
    function addRuleController(
        $mdDialog,
        title,
        about
    ) {

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.close = close;
        self.addRule = addRule;


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.title = title;
        self.about = about;
        self.formInput = {
            rule: '',
            rule_type: '',
            points: ''
        };

        self.rule_types = [
            { type: 1, name: 'Houding', },
            { type: 2, name: 'Functioneren binnen het team', },
            { type: 3, name: 'Kennisontwikkeling', },
            { type: 4, name: 'Verantwoording', },
        ];

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function close() {
            $mdDialog.hide();
        }

        function addRule() {
            $mdDialog.hide(self.formInput);
        }


    }

}());
