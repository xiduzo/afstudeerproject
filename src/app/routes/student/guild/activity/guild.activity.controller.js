(function () {
    'use strict';

    angular
        .module('cmd.guild')
        .controller('GuildActivityController', GuildActivityController);

    /** @ngInject */
    function GuildActivityController(
        $scope,
        Global,
        Guild,
        TrelloApi,
        STUDENT_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < STUDENT_ACCESS_LEVEL) {
            return Global.notAllowed();
        }

        Global.setRouteTitle('Activity log');
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
            { type: 'addMemberToCard', name: 'Persoon toegevoegd', icon: 'add_person_dark', },
            { type: 'removeMemberFromCard', name: 'Persoon verwijderd', icon: 'person_outline_dark', },
            { type: 'createCard', name: 'Kaart toegevoegd', icon: 'add_dark', },
            { type: 'updateCard', name: 'Kaart hernoemd', icon: 'pencil_dark', },
            { type: 'addChecklistToCard', name: 'Checklist toegevoegd', icon: 'list_dark', },
            { type: 'updateCheckItemStateOnCard', name: 'Checklist geupdate', icon: 'list_dark', },
            { type: 'addAttachmentToCard', name: 'Bijlage toegevoegd', icon: 'attachment_dark', },
            { type: 'commentCard', name: 'Comment geplaatst', icon: 'comment_dark', },
            { type: 'movedCard', name: 'Kaart verplaatst', icon: 'move_horizontal_dark', },
            { type: 'addDueDate', name: 'Vervaldatum toegevoegd', icon: 'event_dark', },
            { type: 'updateDueDate', name: 'Vervaldatum aangepast', icon: 'date_range_dark', },
        ];

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Broadcasts
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        $scope.$on('guild-changed', function(event, guild) {
            self.selected_guild = guild;
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getUserGuilds(self.user.id)
        .then(function(response) {
            if(response.guilds.length < 1) {
              self.loading_page = false;
              return false;
            }

            _.each(response.guilds, function(guildObject) {
                var guild = guildObject.guild;
                self.loading_page = true;
                guild.no_trello_board = true;

                if(guild.trello_board !== null) {
                    guild.no_trello_board = false;

                    TrelloApi.Authenticate()
                    .then(function() {

                        guild.board = {
                            members: [],
                            activities: []
                        };

                        TrelloApi.Rest('GET', 'boards/' + guild.trello_board + '/actions', { limit: 1000 })
                        .then(function(response) {
                            self.loading_page = true;
                            response = _.filter(response, function(activity) {
                                switch (activity.type) {
                                    case 'createList':
                                    case 'updateList':
                                    case 'enablePlugin':
                                    case 'disablePlugin':
                                    case 'addToOrganizationBoard':
                                    case 'addMemberToBoard':
                                    case 'createBoard':
                                    case 'deleteCard':
                                        // Do nothing basicly
                                        break;
                                    case 'updateCard':
                                        if(typeof activity.data.old.desc === "string" || activity.data.old.pos) {
                                            // Do nothing again
                                        } else {
                                            return activity;
                                        }
                                        break;
                                    default:
                                        return activity;
                                }
                            });

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
                                activity.sentence = activity.memberCreator.fullName + ' heeft ';
                                switch (activity.type) {
                                    case 'addMemberToCard':
                                        activity.sentence += activity.member.fullName + ' toegevoegd aan ' + activity.data.card.name;
                                        break;
                                    case 'removeMemberFromCard':
                                        activity.sentence += activity.member.fullName + ' verwijderd van ' + activity.data.card.name;
                                        break;
                                    case 'createCard':
                                        activity.sentence += activity.data.card.name + ' toegevoegd aan ' + activity.data.list.name;
                                        break;
                                    case 'updateCard':
                                        if(activity.data.listAfter) {
                                            activity.type = 'movedCard';
                                            activity.sentence += activity.data.card.name + ' verplaatst van ' + activity.data.listBefore.name + ' naar ' + activity.data.listAfter.name;
                                        } else if(activity.data.old.due || activity.data.old.due === null) {
                                            if(activity.data.old.due === null) {
                                                activity.sentence += 'de vervaldatum van ' + activity.data.card.name + ' veplaatst naar ' + moment(activity.data.card.due).format('DD/MM/YYYY') + ' om ' + moment(activity.data.card.due).format('HH:mm');
                                                activity.type = 'updateDueDate';
                                            } else {
                                                activity.sentence += 'de vervaldatum van ' + activity.data.card.name + ' geplaatst op ' + moment(activity.data.card.due).format('DD/MM/YYYY') + ' om ' + moment(activity.data.card.due).format('HH:mm');
                                                activity.type = 'addDueDate';
                                            }
                                        } else if(activity.data.old.name) {
                                            activity.sentence += activity.data.old.name + ' hernoemd naar ' + activity.data.card.name;
                                        } else {
                                            // console.log(activity);
                                        }
                                        break;
                                    case 'updateCheckItemStateOnCard':
                                        activity.sentence += activity.data.checkItem.name + ' gemarkeed als ' + (activity.data.checkItem.state === 'complete' ? 'compleet' : 'oncompleet') + ' op ' + activity.data.card.name;
                                        break;
                                    case 'addChecklistToCard':
                                        activity.sentence += activity.data.checklist.name + ' toegevoegd aan ' + activity.data.card.name;
                                        break;
                                    case 'addAttachmentToCard':
                                        activity.sentence += activity.data.attachment.name + ' bijgevoegd bij ' + activity.data.card.name;
                                        break;
                                    case 'commentCard':
                                        activity.sentence += ' gecomment op ' + activity.data.card.name + ': <q>' + activity.data.text + '</q>';
                                        break;
                                    default:
                                        // console.log(activity.type);
                                }
                                activity.sentence += '.';
                            });

                            guild.activities = _.groupBy(response, function(activity) {
                                return moment(activity.date).startOf('day');
                            });

                            self.guilds.push(guild);
                            self.loading_page = false;

                        });
                    });
                } else {
                    self.guilds.push(guild);
                    self.loading_page = false;
                }
            });
        }, function() {
            // Err get user guilds
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


    }
}());
