(function () {
    'use strict';

    angular
        .module('cmd.components')
        .controller('AasController', AasController);

    /** @ngInject */
    function AasController(
        $filter,
        $mdDialog,
        title,
        subtitle,
        about,
        players
    ) {

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.filterUsers = filterUsers;
        self.selectPlayer = selectPlayer;
        self.removeSelectedPlayer = removeSelectedPlayer;
        self.close = close;
        self.players = players;
        self.returnPlayers = returnPlayers;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.title = title;
        self.subtitle = subtitle;
        self.about = about;

        self.filter_users = [];
        self.selected_users = [];

        // Autoselect modal
        self.search_text = "";
        self.selected_item = undefined;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Functions
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        _.each(self.players, function(player) {
            player.selected = false;
            player.filter_name = $filter('fullUserName')(player);
        });


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function filterUsers(filter) {
            self.filter_users =_.filter(self.players, function(player) {
                if(angular.lowercase(player.filter_name).indexOf(angular.lowercase(filter)) > -1 ) {
                    return player;
                }
            });

        }

        function selectPlayer(player) {
            if(!player) {
                return;
            }

            self.search_text = "";
            self.selected_item = undefined;

            // Remove the player from the possible user list
            self.players.splice(self.players.indexOf(player),1);

            // Add the player to the selected player list
            self.selected_users.push(player);
        }

        function removeSelectedPlayer(player) {
            if(!player) {
                return;
            }

            // Same as selectPlayer, but in reverse
            self.selected_users.splice(self.selected_users.indexOf(player),1);
            self.players.push(player);
            self.filter_users = self.players;
        }

        function close() {
            $mdDialog.hide();
        }

        function returnPlayers() {
            $mdDialog.hide(self.selected_users);
        }

    }

}());
