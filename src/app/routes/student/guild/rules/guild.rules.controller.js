(function () {
    'use strict';

    angular
        .module('cmd.guild')
        .controller('GuildRulesController', GuildRulesController);

    /** @ngInject */
    function GuildRulesController(
        $mdDialog,
        $state,
        Global,
        Guild,
        World,
        Notifications,
        STUDENT_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < STUDENT_ACCESS_LEVEL) {
            Global.notAllowed();
            return;
        }

        Global.setRouteTitle('Feedback');
        Global.setRouteBackRoute(null);

        var self = this;


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.toggleRule = toggleRule;
        self.addRule = addRule;
        self.addRulesToGuild = addRulesToGuild;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.selected_guild = Global.getSelectedGuild();
        self.guilds = [];
        self.world = [];
        self.loading_page = true;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getUserGuilds(self.user.id)
        .then(function(response) {

            _.each(response.guilds, function(guild) {
                self.loading_page = true;
                guild = guild.guild;

                if(guild.accepted_rules) {
                    self.guilds.push(guild);
                    self.loading_page = false;
                    Global.setRouteTitle('Feedback', _.findWhere(self.guilds, { id: self.selected_guild}).name);
                } else {
                    World.getWorld(guild.world.id)
                    .then(function(response) {
                        self.world = response;
                        guild.requirements = {
                            attitude: {
                                selected: 0,
                                check: false,
                            },
                            functioning: {
                                selected: 0,
                                check: false,
                            },
                            knowledge: {
                                selected: 0,
                                check: false,
                            },
                            justification: {
                                selected: 0,
                                check: false,
                            },
                        };
                        guild.selected_rules = [];
                        guild.minimun_rules_selected = false;
                        self.guilds.push(guild);
                        Global.setRouteTitle('Feedback', _.findWhere(self.guilds, { id: self.selected_guild}).name);
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
        function toggleRule(rule, guild) {
            if(rule.selected) {
                guild.selected_rules.push(rule);
            } else {
                guild.selected_rules.splice(_.indexOf(guild.selected_rules, rule), 1);
            }

            guild.minimun_rules_selected = guild.selected_rules.length >= 8 ? true : false;

            switch (rule.rule_type) {
                case 1:
                    guild.requirements.attitude.selected = guild.requirements.attitude.selected + (rule.selected ? 1 : -1);
                    guild.requirements.attitude.check = guild.requirements.attitude.selected >= 1 ? true: false;
                    break;
                case 2:
                    guild.requirements.functioning.selected = guild.requirements.functioning.selected + (rule.selected ? 1 : -1);
                    guild.requirements.functioning.check = guild.requirements.functioning.selected >= 1 ? true: false;
                    break;
                case 3:
                    guild.requirements.knowledge.selected = guild.requirements.knowledge.selected + (rule.selected ? 1 : -1);
                    guild.requirements.knowledge.check = guild.requirements.knowledge.selected >= 1 ? true: false;
                    break;
                case 4:
                    guild.requirements.justification.selected = guild.requirements.justification.selected + (rule.selected ? 1 : -1);
                    guild.requirements.justification.check = guild.requirements.justification.selected >= 1 ? true: false;
                    break;
            }
        }

        function addRule(event, guild) {
            $mdDialog.show({
                controller: 'addGuildRuleController',
                controllerAs: 'addGuildRuleCtrl',
                templateUrl: 'app/routes/student/guild/rules/add/add.html',
                targetEvent: event,
                clickOutsideToClose: true,
                locals: {
                    title: 'Add rule for ' + guild.name,
                    about: 'rule',
                }
            })
            .then(function(response) {
                if(!response.type ||
                !response.importance ||
                !response.rule) {
                    Notifications.simpleToast('Please fill in all the fields');
                }

                var tempObj = {
                    points: response.importance,
                    rule: response.rule,
                    rule_type: response.type,
                    selected: true
                };

                self.world.rules.push(tempObj);
                self.toggleRule(tempObj, guild);
            }, function() {
                // Err dialog
            });
        }

        function addRulesToGuild(guild) {
            console.log(guild.selected_rules);
        }

    }

}());
