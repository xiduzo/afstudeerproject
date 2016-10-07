(function () {
    'use strict';

    angular
        .module('cmd.guild')
        .controller('GuildActivityController', GuildActivityController);

    /** @ngInject */
    function GuildActivityController(
        $filter,
        $scope,
        hotkeys,
        Global,
        Guild,
        STUDENT_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < STUDENT_ACCESS_LEVEL) {
            return Global.notAllowed();
        }

        var self = this;


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.loadMoreHistoryUpdates = loadMoreHistoryUpdates;
        self.addHotkeys = addHotkeys;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.loading_page = true;
        self.getting_more_activities = false;
        self.nothing_more_to_load = false;
        self.guilds = [];
        self.selected_guild = Global.getSelectedGuild();
        self.action_types = [
            { type: 1, name: 'Added task', icon: 'add_light', },
            { type: 2, name: 'Removed task', icon: 'delete_light', },
            { type: 3, name: 'Assigned', icon: 'add_person_light', },
            { type: 4, name: 'Removed assignment', icon: 'person_outline_light', },
            { type: 5, name: 'Completed task', icon: 'check_light', },
            { type: 6, name: 'Uncomplete task', icon: 'uncheck_light', },
            { type: 7, name: 'Graded assessment', icon: 'pencil_light', },
            { type: 8, name: 'Regraded assessment', icon: 'again_light', },
            { type: 9, name: 'Completed assessment', icon: 'done_light', },
            { type: 10, name: 'Uncomplete assessment', icon: 'remove_light', },
        ];

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getUserGuilds(self.user.id)
        .then(function(response) {
            _.each(response.guilds, function(guildObject) {
                var guild = guildObject.guild;
                self.loading_page = true;

                guild.user_filter_list = [];

                _.each(guild.history_updates, function(update) {
                    update.user_id = update.user.id;
                    if(!_.findWhere(guild.user_filter_list, {id: update.user.id})) {
                        guild.user_filter_list.push({
                            id: update.user.id,
                            name: $filter('fullUserName')(update.user),
                            email: update.user.email
                        });
                    }
                });

                self.guilds.push(guild);
            });

            self.addHotkeys();
            self.loading_page = false;

        }, function() {
            // Err get user guilds
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function loadMoreHistoryUpdates(guild) {
            self.getting_more_activities = true;
            Guild.loadMoreHistoryUpdates(guild.id, guild.history_updates.length)
            .then(function(response) {
                if(response.length < 25) {
                    return self.nothing_more_to_load = true;
                }
                _.each(response, function(update) {
                    update.user_id = update.user.id;
                    if(!_.findWhere(guild.user_filter_list, {id: update.user.id})) {
                        guild.user_filter_list.push({
                            id: update.user.id,
                            name: $filter('fullUserName')(update.user),
                            email: update.user.email
                        });
                    }
                    guild.history_updates.push(update);
                });
                self.getting_more_activities = false;
            })
            .catch(function(error) {
                console.log(error);
            });
        }

        function addHotkeys() {
            hotkeys.bindTo($scope)
            .add({
                combo: 'ctrl+space',
                description: 'Load more activities',
                callback: function() {
                    var guild = _.findWhere(self.guilds, {id: self.selected_guild});
                    if(!self.getting_more_activities) {
                        self.loadMoreHistoryUpdates(guild);
                    }
                }
            });
        }

    }

}());
