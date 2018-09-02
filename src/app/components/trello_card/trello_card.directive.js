(function () {
    'use strict';

    angular
        .module('cmd.components')
        .directive('trelloCard', trelloCard);

    /** @ngInject */
    function trelloCard() {

        return {
            restrict: 'E',
            templateUrl: 'app/components/trello_card/trello_card.html',
            controller: 'TrelloCardController',
            controllerAs: 'trelloCardCtrl',
            replace: true,
            bindToController: true,
            scope: {
                card: '=card'
            }
        };

    }

}());
