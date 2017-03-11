(function () {
    'use strict';

    angular
        .module('cmd.guild')
        .controller('GuildRulesController', GuildRulesController);

    /** @ngInject */
    function GuildRulesController(
        $filter,
        $mdDialog,
        $state,
        $scope,
        Global,
        Guild,
        World,
        Rules,
        Notifications,
        md5,
        STUDENT_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < STUDENT_ACCESS_LEVEL) {
            return Global.notAllowed();
        }

        Global.setRouteTitle('Feedback');
        Global.setRouteBackRoute(null);

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.toggleRule = toggleRule;
        self.removeRule = removeRule;
        self.addRule = addRule;
        self.addRulesToGuild = addRulesToGuild;
        self.toggleRuleEndorsement = toggleRuleEndorsement;
        self.checkRuleEndorsementStatus = checkRuleEndorsementStatus;
        self.showPasswordPrompt = showPasswordPrompt;
        self.setRating = setRating;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.selected_guild = Global.getSelectedGuild();
        self.guilds = [];
        self.world = [];
        self.rules = [];
        self.loading_page = true;
        self.password_protection = false;

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

            _.each(response.guilds, function(guild) {
                self.loading_page = true;
                guild = guild.guild;

                World.getWorld(guild.world.id)
                .then(function(response) {
                    self.world = response;
                    guild.rules_selected = false;
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
                    } else {
                        guild.rules_selected = true;
                        // TODO
                        // build angular prompt which has a password field
                        // self.password_protection = true;
                        // self.showPasswordPrompt();
                    }

                    guild.weeks = [];
                    guild.selected_week = null;
                    self.world.course_duration = self.world.course_duration ? self.world.course_duration : 48;
                    self.world.start = self.world.start ? self.world.start : self.world.created_at;

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
                            guild.editable_week = guild.weeks.length;
                        }

                        guild.weeks.push(tempObj);
                    }

                    Rules.getRules()
                    .then(function(response) {
                        guild.possible_rules = _.groupBy(response, function(rule) {
                            return rule.rule_type;
                        });
                        self.guilds.push(guild);
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
        function removeRule(rule, guild) {
            rule.selected = false;
            self.toggleRule(rule, guild);
            rule = null;
        }

        function toggleRule(rule, guild) {
            if(rule.selected) {
                guild.selected_rules.push(rule);
            } else {
                guild.selected_rules.splice(_.indexOf(guild.selected_rules, rule), 1);
            }

            guild.minimun_rules_selected = guild.selected_rules.length >= 8 ? true : false;

            // This should be done in a better way somehow
            if(rule.own_rule) {
                if(rule.selected === false) {
                    guild.own_rule = null;
                }
                rule.selected = false;
            } else {
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
        }

        function addRule(event, guild) {
            $mdDialog.show({
                controller: 'addGuildRuleController',
                controllerAs: 'addGuildRuleCtrl',
                templateUrl: 'app/routes/student/guild/rules/add/add.html',
                targetEvent: event,
                clickOutsideToClose: true,
            })
            .then(function(response) {
                if(!response.type ||
                !response.importance ||
                !response.rule) {
                    return Notifications.simpleToast('Please fill in all the fields');
                }

                if(response.importance >= 95) {
                    response.points = 13;
                } else if (response.importance > 70) {
                    response.points = 8;
                } else if (response.importance > 40) {
                    response.points = 5;
                } else if (response.importance > 20) {
                    response.points = 3;
                } else if (response.importance > 10) {
                    response.points = 2;
                } else {
                    response.points = 1;
                }

                var tempObj = {
                    points: response.points,
                    rule: response.rule,
                    rule_type: response.type,
                    selected: true,
                    own_rule: true,
                };
                guild.own_rule = (tempObj);
                self.toggleRule(tempObj, guild);
            }, function() {
                // Err dialog
            });
        }

        function addRulesToGuild(event, guild) {
            $mdDialog.show({
                controller: 'confirmGuildRulesController',
                controllerAs: 'confirmGuildRulesCtrl',
                templateUrl: 'app/routes/student/guild/rules/confirm/confirm.html',
                targetEvent: event,
                clickOutsideToClose: true,
                locals: {
                    rules: guild.selected_rules,
                }
            })
            .then(function(response) {
                if(response) {
                    _.each(guild.selected_rules, function(rule) {
                        self.loading_page = true;
                        Guild.addGuildRule(guild.id, rule)
                        .then(function(response) {
                            self.loading_page = false;
                        })
                        .catch(function(error) {
                            console.log(error);
                        });
                    });
                }
            }, function() {
                // Err dialog
            });
        }

        function toggleRuleEndorsement(guild, week, rule, user, state) {
            if(state) {
                Guild.addEndorsement(rule.id, user.id, self.user.id, week)
                .then(function(response) {
                    rule.endorsements.push(response);
                    Notifications.simpleToast('Endorsed: ' + $filter('fullUserName')(user) + ' ' + rule.rule);
                })
                .catch(function(error) {
                    console.log(error);
                });
            } else {
                var endorsement = _.findWhere(rule.endorsements, {
                    endorsed_by: self.user.id,
                    week: week,
                    user: user.id,
                    rule_id: rule.id
                });

                Guild.removeEndorsement(endorsement.id)
                .then(function(response) {
                    if(response.status === 204) {
                        rule.endorsements.splice(_.indexOf(rule.endorsements, rule), 1);
                        Notifications.simpleToast('Removed endorsed: ' + $filter('fullUserName')(user) + ' ' + rule.rule);
                    }
                })
                .catch(function(error) {
                    console.log(error);
                });
            }
        }

        function checkRuleEndorsementStatus(guild, week, rule, user) {
            _.each(rule.endorsements, function(endorsement) {
                endorsement.rule_id = endorsement.rule.id;
            });

            var endorsement = _.findWhere(rule.endorsements, {
                endorsed_by: self.user.id,
                week: week,
                user: user.id,
                rule_id: rule.id
            });

            return endorsement ? endorsement.rating : 0;
        }

        function showPasswordPrompt() {
            Notifications.prompt(
                'Password Required',
                'This page contains sensitive information, please enter your password to continue',
                'password',
                event
            )
            .then(function(result) {
                // Checks for the world name
                if(!result) {
                    return Notifications.simpleToast('Please enter a password');
                }

                if(md5(result) === self.user.password) {
                    self.password_protection = false;
                } else {
                    Notifications.simpleToast('Incorrect password');
                }

            }, function() {
                // Cancel dialog
            });
        }

        function setRating(guild, week, rule, user, rating) {
            _.each(rule.endorsements, function(endorsement) {
                endorsement.rule_id = endorsement.rule.id;
            });

            var endorsement = _.findWhere(rule.endorsements, {
                endorsed_by: self.user.id,
                week: week,
                user: user.id,
                rule_id: rule.id
            });

            if(endorsement) {
                Guild.patchEndorsement(endorsement.id, rating)
                .then(function(response) {
                    Notifications.simpleToast('Endorsed: ' + $filter('fullUserName')(user) + ' ' + rule.rule + ' with ' + rating + ' star(s)');
                })
                .catch(function(error) {
                    console.log(error);
                });
            } else {
                Guild.addEndorsement(rule.id, user.id, self.user.id, week, rating)
                .then(function(response) {
                    rule.endorsements.push(response);
                    Notifications.simpleToast('Endorsed: ' + $filter('fullUserName')(user) + ' ' + rule.rule + ' with ' + rating + ' star(s)');
                })
                .catch(function(error) {
                    console.log(error);
                });
            }
        }


    }
}());
