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
        self.patchQuestStatus = patchQuestStatus;

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
                    GLobal.simpleToast('Group ' + $stateParams.guildUuid + ' does not exist');
                    $state.go('base.guilds.overview');
                }

                self.guild = response;
                console.log(self.guild);
                // response.members = [];
                //
                // self.guild = response;
                //
                // Guild.getGuildMembers($stateParams.guildUuid)
                //     .then(function(response) {
                //         self.guild.members = response;
                //     }, function() {
                //         // Err
                //     });

            }, function() {
                // Err
            });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function patchQuestStatus(quest) {
            Guild.patchQuestStatus(quest)
            .then(function(response) {
                if(response.completed) {
                    Global.simpleToast('Asignment marked as completed');
                } else {
                    Global.simpleToast('Asignment marked as uncompleted');
                }
            }, function(error) {
                // Err patch quest completion status
            });
        }


    }

}());
