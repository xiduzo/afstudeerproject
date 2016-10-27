(function () {
    'use strict';

    angular
        .module('cmd.home')
        .controller('LecturerDashboardController', LecturerDashboardController);

    /** @ngInject */
    function LecturerDashboardController(
        Global,
        TrelloApi
    ) {

        var self = this;


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();

        Global.setRouteTitle('Dashboard');

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        TrelloApi.Authenticate().then(function(){
            // alert(TrelloApi.Token());
        }, function(){
            alert('no');
        });

        TrelloApi.Rest('GET', 'members/me').then(function(res){
            var board = {
                name: null,
                id: res.idBoards[0],
                cards: []
            };
            TrelloApi.Rest('GET', 'boards/'+res.idBoards[0]).then(function(res) {
                board.name = res.name;
            });

            TrelloApi.Rest('GET', 'boards/'+res.idBoards[0]+'/cards').then(function(res) {
                res = _.groupBy(res, function(card) {
                    return card.idList;
                });

                console.log(res);

                _.each(res, function(group) {
                    _.each(group, function(card) {
                        board.cards.push({card: card, done: false});
                    });
                });

                console.log(board);

            }, function(err) {
                console.log(err);
            });
        }, function(err){
            console.log(err);
        });

    }

}());
