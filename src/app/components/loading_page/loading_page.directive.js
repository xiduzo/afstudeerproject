(function () {
    'use strict';

    angular
        .module('cmd.components')
        .directive('cmdLoadingPage', cmdLoadingPage);

    /** @ngInject */
    function cmdLoadingPage() {

        return {
            restrict: 'E',
            templateUrl: 'app/components/loading_page/loading_page.html',
            controller: 'LoadingPageController',
            controllerAs: 'loadingPageCtrl',
            replace: true,
            bindToController: true,
        };

    }

}());
