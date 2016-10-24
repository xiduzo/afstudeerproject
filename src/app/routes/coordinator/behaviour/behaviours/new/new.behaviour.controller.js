(function () {
    'use strict';

    angular
        .module('cmd.worlds')
        .controller('addBehaviourController', addBehaviourController);

    /** @ngInject */
    function addBehaviourController(
        $mdDialog
    ) {

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.close = close;
        self.addBehaviour = addBehaviour;


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.formInput = {
            behaviour: undefined,
            points: 50,
            rupees: [
                { type: 1, name: 'ruby', amount: 0, },
                { type: 2, name: 'sapphire', amount: 0, },
                { type: 3, name: 'emerald', amount: 0, },
                { type: 4, name: 'amethyst', amount: 0, },
            ]
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

        function addBehaviour() {
            $mdDialog.hide(self.formInput);
        }


    }

}());
