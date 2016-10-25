(function () {
    'use strict';

    angular
        .module('cmd.stimulance')
        .controller('rewardPlayersController', rewardPlayersController);

    /** @ngInject */
    function rewardPlayersController(
        $mdDialog,
        player,
        Behaviour
    ) {

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.close = close;
        self.addStimulance = addStimulance;
        self.player = player;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.behaviours = [];

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Behaviour.getBehaviours()
        .then(function(response) {
            _.each(response, function(behaviour) {
                behaviour.selected = false;
                self.behaviours.push(behaviour);
            });
        })
        .catch(function(error) {
            console.log(error);
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function close() {
            $mdDialog.hide();
        }

        function addStimulance() {
            $mdDialog.hide(self.behaviours);
        }


    }

}());
