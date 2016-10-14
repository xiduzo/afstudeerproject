(function () {
    'use strict';

    angular
        .module('cmd.guild')
        .controller('addGuildRuleController', addGuildRuleController);

    /** @ngInject */
    function addGuildRuleController(
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
            type: 1,
            rule: undefined,
            importance: 50
        };
        self.types = [
            { type: 1, name: 'Houding', icon: 'work_dark', },
            { type: 2, name: 'Functioneren binnen het team', icon: 'group_work_dark', },
            { type: 3, name: 'Kennisontwikkeling', icon: 'lightbulb_dark', },
            { type: 4, name: 'Verantwoording', icon: 'description_dark', },
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
