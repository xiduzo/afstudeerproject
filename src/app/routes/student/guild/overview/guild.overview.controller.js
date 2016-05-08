(function () {
    'use strict';

    angular
        .module('cmd.guild')
        .controller('GuildOverviewController', GuildOverviewController);

    /** @ngInject */
    function GuildOverviewController(
        Guild,
        Global,
        STUDENT_ACCESS_LEVEL
    ) {

        var self = this;

        if(Global.getAccess() !== STUDENT_ACCESS_LEVEL) {
            Global.notAllowed();
            return;
        }

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.guilds = [];

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getUserGuilds(self.user.uid)
            .then(function(response) {
                _.each(response, function(guild) {
                    guild.members = [];
                    self.guilds.push(guild);
                    Guild.getGuildMembers(guild.uuid)
                        .then(function(response) {
                            _.each(response, function(member) {
                                guild.members.push(member);
                            });
                        }, function() {
                            // Err
                        });
                });
            }, function() {
                // Err
            });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    }

}());
