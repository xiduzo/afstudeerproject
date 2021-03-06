(function () {
    'use strict';

    angular
        .module('cmd.components')
        .directive('cmdToolbar', cmdToolbar);

    /** @ngInject */
    function cmdToolbar() {

        return {
            restrict: 'E',
            templateUrl: 'app/components/toolbar/toolbar.html',
            controller: 'Toolbarcontroller',
            controllerAs: 'toolbarCtrl',
            replace: true,
            bindToController: true,
        };

    }

}());
