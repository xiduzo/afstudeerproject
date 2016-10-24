(function () {
    'use strict';

    angular
        .module('cmd.worlds')
        .controller('addRewardController', addRewardController);

    /** @ngInject */
    function addRewardController(
        $mdDialog
    ) {

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.close = close;
        self.addReward = addReward;


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.formInput = {
            reward: undefined,
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

        function addReward() {
            $mdDialog.hide(self.formInput);
        }


    }

}());
