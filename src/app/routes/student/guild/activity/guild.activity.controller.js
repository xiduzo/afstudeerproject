(function () {
    'use strict';

    angular
        .module('cmd.guild')
        .controller('GuildActivityController', GuildActivityController);

    /** @ngInject */
    function GuildActivityController(
        $rootScope,
        $filter,
        $scope,
        hotkeys,
        Global,
        Guild,
        TrelloApi,
        STUDENT_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < STUDENT_ACCESS_LEVEL) {
            return Global.notAllowed();
        }

        Global.setRouteTitle('Activity');
        Global.setRouteBackRoute(null);

        var self = this;


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.selected_guild = Global.getSelectedGuild();
        self.loading_page = true;
        self.guilds = [];
        self.action_types = [
            { type: 'createCard', name: 'Added card', icon: 'add_light', },
            { type: 'updateCard', name: 'Updated card', icon: 'pencil_light', },
            { type: 'movedCard', name: 'Moved card', icon: 'move_horizontal_light', },
            { type: 'addMemberToCard', name: 'Add member to card', icon: 'add_person_light', },
            { type: 'removeMemberFromCard', name: 'Removed member from card', icon: 'person_outline_light', },
            { type: 'createList', name: 'Created list', icon: 'list_light', },
            { type: 'updateList', name: 'Updated list', icon: 'pencil_light', },
        ];



        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getUserGuilds(self.user.id)
        .then(function(response) {
            _.each(response.guilds, function(guildObject) {
                var guild = guildObject.guild;
                self.loading_page = true;

                guild.no_trello_board = true;
                if(guild.trello_board) {
                    guild.no_trello_board = false;
                    TrelloApi.Authenticate()
                    .then(function() {

                        guild.board = {
                            members: [],
                            activities: []
                        };


                        TrelloApi.Rest('GET', 'boards/' + guild.trello_board + '/actions')
                        .then(function(response) {
                            _.each(response, function(activity) {
                                if(!_.findWhere(guild.board.members, {id: activity.memberCreator.id})) {
                                    guild.board.members.push({
                                        id: activity.memberCreator.id,
                                        name: activity.memberCreator.fullName,
                                        avatar: activity.memberCreator.avatarHash,
                                        initials: activity.memberCreator.initials
                                    });
                                }

                                if(activity.data.card) {
                                    activity.link = 'https://trello.com/c/' + activity.data.card.shortLink;
                                } else if(activity.data.list) {
                                    activity.link = 'https://trello.com/b/' + activity.data.board.shortLink;
                                }

                                activity.creator_id = activity.memberCreator.id;

                                switch (activity.type) {
                                    case 'addMemberToCard':
                                        activity.sentence = activity.memberCreator.fullName + ' added ' + activity.member.fullName + ' to ' + activity.data.card.name;
                                        activity.subject = activity.data.card.name;
                                        guild.board.activities.push(activity);
                                        break;
                                    case 'removeMemberFromCard':
                                        activity.sentence = activity.memberCreator.fullName + ' removed ' + activity.member.fullName + ' from ' + activity.data.card.name;
                                        activity.subject = activity.data.card.name;
                                        guild.board.activities.push(activity);
                                        break;
                                    case 'createCard':
                                        activity.sentence = activity.memberCreator.fullName + ' added ' + activity.data.card.name + ' to ' + activity.data.list.name;
                                        activity.subject = activity.data.card.name;
                                        guild.board.activities.push(activity);
                                        break;
                                    case 'updateCard':
                                        activity.subject = activity.data.card.name;
                                        if(activity.data.listAfter) {
                                            activity.type = 'movedCard';
                                            activity.sentence = activity.memberCreator.fullName + ' moved ' + activity.data.card.name + ' from ' + activity.data.listBefore.name + ' to ' + activity.data.listAfter.name;
                                            guild.board.activities.push(activity);
                                        } else {
                                            activity.sentence = activity.memberCreator.fullName + ' renamed ' + activity.data.old.name + ' to ' + activity.data.card.name;
                                            guild.board.activities.push(activity);
                                        }
                                        break;
                                    case 'createList':
                                        activity.subject = activity.data.list.name;
                                        activity.sentence = activity.memberCreator.fullName + ' created ' + activity.data.list.name;
                                        guild.board.activities.push(activity);
                                        break;
                                    case 'updateList':
                                        activity.subject = activity.data.list.name;
                                        activity.sentence = activity.memberCreator.fullName + ' renamed ' + activity.data.old.name + ' to ' + activity.data.list.name;
                                        guild.board.activities.push(activity);
                                        break;
                                }
                            });

                            self.guilds.push(guild);
                            self.loading_page = false;

                        });
                    });
                } else {
                    self.guilds.push(guild);
                }
            });
        }, function() {
            // Err get user guilds
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Broadcasts
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        $rootScope.$on('guild-changed', function(event, guild) {
            self.selected_guild = guild;
            Global.setRouteTitle('Activity', _.findWhere(self.guilds, { id: self.selected_guild}).name);
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


    }
}());
