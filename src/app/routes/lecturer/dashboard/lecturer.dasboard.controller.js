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
            // console.log(res.idBoards);

            TrelloApi.Rest('GET', 'boards/'+res.idBoards[0]+'/cards').then(function(res) {
                console.log(res);
                // TrelloApi.cards(res.id).then(function(res) {
                //     console.log(res);
                // }, function(err) {
                //     console.log(err);
                // });
                res = _.groupBy(res, function(card) {
                    return card.idList;
                });

                console.log(res);
            }, function(err) {
                console.log(err);
            });
        }, function(err){
            console.log(err);
        });

    }

}());
