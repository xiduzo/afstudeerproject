(function () {
    'use strict';

    angular
        .module('cmd.behaviour')
        .controller('BehavioursController', BehavioursController);

    /** @ngInject */
    function BehavioursController(
        $mdDialog,
        Behaviour,
        Global,
        Notifications,
        LECTURER_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < LECTURER_ACCESS_LEVEL) {
            return Global.notAllowed();
        }

        Global.setRouteTitle('Behaviours');
        Global.setRouteBackRoute(null);

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.addBehaviour = addBehaviour;
        self.removeBehaviour = removeBehaviour;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.access = Global.getAccess();
        self.behaviours = [];

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Behaviour.getBehavours()
        .then(function(response) {
            self.behaviours = response;
            console.log(response);
        })
        .catch(function(error) {
            console.log(error);
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function addBehaviour(event) {
            $mdDialog.show({
                controller: 'addBehaviourController',
                controllerAs: 'addBehaviourCtrl',
                templateUrl: 'app/routes/coordinator/behaviour/behaviours/new/new.html',
                targetEvent: event,
                clickOutsideToClose: true
            })
            .then(function(response) {
                if(!response.behaviour) {
                    return Notifications.simpleToast('Please enter an behaviour');
                }

                var rupees = response.rupees;

                if(response.importance >= 95) {
                    response.points = 13;
                } else if (response.importance > 70) {
                    response.points = 8;
                } else if (response.importance > 40) {
                    response.points = 5;
                } else if (response.importance > 20) {
                    response.points = 3;
                } else if (response.importance > 10) {
                    response.points = 2;
                } else {
                    response.points = 1;
                }

                response.behaviour_type = 1;

                Behaviour.addBehaviour(response)
                .then(function(response) {
                    var behaviour = response;
                    behaviour.rewards = [];

                    _.each(rupees, function(rupee) {
                        rupee.rupee = rupee.type;
                        Behaviour.addBehaviourRupeeReward(
                            behaviour,
                            rupee.type,
                            rupee.amount
                        )
                        .then(function(response) {
                            behaviour.rewards.push(response);
                        })
                        .catch(function(error) {
                            console.log(error);
                        });
                    });

                    self.behaviours.push(behaviour);
                    Notifications.simpleToast('Added new behaviour: ' + response.behaviour);
                })
                .catch(function(error) {
                    console.log(error);
                });
            })
            .catch(function() {
                // Closed
            });
            // function prompt(title, context, label, event)
        }

        function removeBehaviour(behaviour) {
            Behaviour.removeBehaviour(behaviour.id)
            .then(function(response) {
                self.behaviours.splice(_.indexOf(self.behaviours, behaviour), 1);
                Notifications.simpleToast('Removed behaviour: ' + behaviour.behaviour);
            })
            .catch(function(error) {
                console.log(error);
            });
        }

    }
}());
