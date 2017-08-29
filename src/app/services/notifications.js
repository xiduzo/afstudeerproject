(function () {
    'use strict';

    angular
        .module('cmd.services')
        .factory('Notifications', Notifications);

    /** @ngInject */
    function Notifications(
        $mdDialog,
        $mdToast
    ) {

        var services = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        services.simpleToast = simpleToast;
        services.confirmation = confirmation;
        services.prompt = prompt;

        return services;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function simpleToast(toast, duration) {
            $mdToast.show(
                $mdToast.simple()
                .textContent(toast)
                .position('bottom right')
                .hideDelay(duration || 3000)
            );
        }

        function confirmation(title, context, label, event) {
            var dialog = $mdDialog.confirm()
                .title(title)
                .textContent(context)
                .clickOutsideToClose(true)
                .ariaLabel(label)
                .targetEvent(event)
                .ok('Ja, ik accepteerd de consequenties')
                .cancel('Nope, ik weet dit niet zeker!');

            return $mdDialog.show(dialog);
        }

        function prompt(title, context, label, event) {
            var dialog = $mdDialog.prompt()
                .title(title)
                .textContent(context)
                .clickOutsideToClose(true)
                .placeholder(label)
                .ariaLabel(label)
                .targetEvent(event)
                .ok('Ok')
                .cancel('Cancel');

            return $mdDialog.show(dialog);
        }
    }

}());
