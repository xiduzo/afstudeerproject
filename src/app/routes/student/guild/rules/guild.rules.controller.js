(function () {
    'use strict';

    angular
        .module('cmd.guild')
        .controller('GuildRulesController', GuildRulesController);

    /** @ngInject */
    function GuildRulesController(
        $state,
        Global,
        Guild,
        World
    ) {

        var self = this;


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.selected_guild = Global.getSelectedGuild();
        self.guilds = [];
        self.world = [];
        self.selected_rules = [];
        self.loading_page = true;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getUserGuilds(self.user.id)
        .then(function(response) {

            _.each(response.guilds, function(guild) {
                self.loading_page = true;
                guild = guild.guild;

                if(guild.accepted_rules) {
                    self.guilds.push(guild);
                    self.loading_page = false;
                } else {
                    World.getWorld(guild.world.id)
                    .then(function(response) {
                        console.log(response);
                        self.world = response;
                        self.guilds.push(guild);
                        self.loading_page = false;
                    })
                    .catch(function(error) {
                        console.log(error);
                    });
                }
            });
        })
        .catch(function(error) {
            console.log(error);
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    }

}());
