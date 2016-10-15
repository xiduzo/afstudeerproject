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
        Rules,
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
        self.toggleRuleCompletion = toggleRuleCompletion;

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

                World.getWorld(guild.world.id)
                .then(function(response) {
                    self.world = response;

                    if(guild.rules.length < 8) {
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
                    }

                    guild.weeks = [];
                    guild.selected_week = null;
                    guild.endorsed_rules = [];
                    guild.removed_endorsed_rules = [];

                    for(var i = self.world.course_duration; i > 0; i -= 7) {
                        var start_week = moment(self.world.start).add(guild.weeks.length * 7 , 'days');
                        var end_week = moment(self.world.start).add(guild.weeks.length * 7 + 7 , 'days');
                        var tempObj = {
                            week: guild.weeks.length,
                            start: start_week,
                            end: end_week,
                            editable: false
                        };

                        if (moment().isBetween(start_week, end_week)) {
                            tempObj.editable = true;
                            guild.selected_week = guild.weeks.length;
                        }

                        guild.weeks.push(tempObj);
                    }

                    Rules.getRules()
                    .then(function(response) {
                        guild.possible_rules = response;
                        self.guilds.push(guild);
                        Global.setRouteTitle('Feedback', _.findWhere(self.guilds, { id: self.selected_guild}).name);
                        self.loading_page = false;
                    })
                    .catch(function(error) {
                        console.log(error);
                    });
                    
                })
                .catch(function(error) {
                    console.log(error);
                });

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

                if(response.importance > 90) {
                    response.points = 13;
                } else if (response.importance > 75) {
                    response.points = 8;
                } else if (response.importance > 60) {
                    response.points = 5;
                } else if (response.importance > 45) {
                    response.points = 3;
                } else if (response.importance > 30) {
                    response.points = 2;
                } else {
                    response.points = 1;
                }

                var tempObj = {
                    points: response.points,
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

        function addRulesToGuild(event, guild) {
            console.log(guild.selected_rules);
            $mdDialog.show({
                controller: 'confirmGuildRulesController',
                controllerAs: 'confirmGuildRulesCtrl',
                templateUrl: 'app/routes/student/guild/rules/confirm/confirm.html',
                targetEvent: event,
                clickOutsideToClose: true,
                locals: {
                    title: 'Check rules for ' + guild.name,
                    about: 'rules',
                    rules: guild.selected_rules,
                }
            })
            .then(function() {

                _.each(guild.selected_rules, function(rule) {
                    self.loading_page = true;
                    console.log(rule);
                    Guild.addGuildRule(guild.id, rule)
                    .then(function(response) {
                        self.loading_page = false;
                    })
                    .catch(function(error) {
                        console.log(error);
                    });
                });
            }, function() {
                // Err dialog
            });
        }

        function toggleRuleCompletion(guild, week, rule, user, state) {
            if(state) {
                guild.endorsed_rules.push( {
                    id: rule.id+'-'+user.id+'-'+week,
                    rule: rule,
                    week: week,
                    user: user
                });
            } else {
                guild.endorsed_rules.splice(
                    _.indexOf(
                        guild.endorsed_rules,
                        _.findWhere(
                            guild.endorsed_rules,
                            { id: rule.id+'-'+user.id+'-'+week }
                        )
                    ),
                    1
                );
            }
        }

    }

}());
