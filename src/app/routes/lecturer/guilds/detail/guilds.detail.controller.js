(function () {
    'use strict';

    angular
        .module('cmd.guilds')
        .controller('GuildDetailController', GuildDetailController);

    /** @ngInject */
    function GuildDetailController(
        $stateParams,
        $mdToast,
        $state,
        Guild,
        Global,
        World,
        LECTURER_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < LECTURER_ACCESS_LEVEL) {
            Global.notAllowed();
            return;
        }

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.guild = [];

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getGuild($stateParams.guildUuid)
            .then(function(response) {
                if(!response) {
                    $mdToast.show(
                        $mdToast
                        .simple()
                        .position('bottom right')
                        .textContent('Guild ' + $stateParams.guildUuid + ' does not exist')
                        .hideDelay(1000)
                    );
                    $state.go('base.guilds.overview');
                }

                response.members = [];

                self.guild = response;

                Guild.getGuildMembers($stateParams.guildUuid)
                    .then(function(response) {
                        self.guild.members = response;
                    }, function() {
                        // Err
                    });

            }, function() {
                // Err
            });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


    }

}());
