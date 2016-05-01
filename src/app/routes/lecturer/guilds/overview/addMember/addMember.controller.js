(function () {
    'use strict';

    angular
        .module('cmd.guilds')
        .controller('GuildsAddMemberController', GuildsAddMemberController);

    /** @ngInject */
    function GuildsAddMemberController(
        $mdDialog,
        guildUuid,
        Guild
    ) {

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.filterUsers = filterUsers;
        self.selectPlayer = selectPlayer;
        self.removeSelectedPlayer = removeSelectedPlayer;
        self.close = close;
        self.addPlayersToTeam = addPlayersToTeam;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.users_without_guild = [];
        self.filter_users = [];
        self.selected_users = [];
        self.search_text = "";
        self.selected_item = undefined;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getUsersWithoutGuild()
            .then(function(response) {
                _.each(response, function(player) {
                    player.selected = false;
                    player.filter_name = player.displayname + ' ' + player.surname;
                    self.users_without_guild.push(player);
                });

                self.filter_users = self.users_without_guild;
            }, function() {
                // Err
            });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function filterUsers(filter) {
            self.filter_users =_.filter(self.users_without_guild, function(player) {
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
            self.users_without_guild.splice(self.users_without_guild.indexOf(player),1);

            // Add the player to the selected player list
            self.selected_users.push(player);
        }

        function removeSelectedPlayer(player) {
            if(!player) {
                return;
            }

            // Same as selectPlayer, but in reverse
            self.selected_users.splice(self.selected_users.indexOf(player),1);
            self.users_without_guild.push(player);
            self.filter_users = self.users_without_guild;
        }

        function close() {
            $mdDialog.hide();
        }

        function addPlayersToTeam() {
            $mdDialog.hide(self.selected_users);
        }

    }

}());
