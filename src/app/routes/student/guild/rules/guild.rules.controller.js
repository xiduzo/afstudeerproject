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
        localStorageService,
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
        self.checkRuleEndorsementStatus = checkRuleEndorsementStatus;
        self.showPasswordPrompt = showPasswordPrompt;
        self.setRating = setRating;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.selected_guild = Global.getSelectedGuild();
        self.guilds = [];
        self.loading_page = true;
        self.active_password_promp = false;
        self.password_protection = false;
        self.showBurst = showBurst;

        var burst = new mojs.Burst({
          left: 0, top: 0,
          radius:   { 6: 24 - 3 },
          angle:    90,
          children: {
            shape:        'circle',
            radius:       24 / 2.2,
            fill:         '#FFCC00',
            degreeShift:  'stagger(0,-5)',
            duration:     700,
            delay:        200,
            easing:       'quad.out',
            // delay:        100,
          }
        });
        var timeline = new mojs.Timeline({ speed: 1.5 });
        timeline.add( burst );

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Broadcasts
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        $scope.$on('guild-changed', function(event, guild) {
            self.selected_guild = guild;
            if(localStorageService.get('settings').password_protection && !self.active_password_promp) {
              self.password_protection = true;
              self.showPasswordPrompt();
            }
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
                    guild.world = response;
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
                        if(localStorageService.get('settings').password_protection && !self.active_password_promp) {
                          self.password_protection = true;
                          self.showPasswordPrompt();
                        }
                    }

                    guild.weeks = [];

                    for(var index = 0; index <= guild.world.course_duration; index++) {
                        guild.weeks.push({
                            index: index,
                            name: 'Week ' + (index+1),
                            start: moment(guild.world.start).add(index, 'weeks'),
                            end: moment(guild.world.start).add(index, 'weeks').add(6, 'days'),
                            editable: moment().isBetween(
                            moment(guild.world.start).add(index, 'weeks'),
                            moment(guild.world.start).add(index, 'weeks').add(6, 'days'),
                            'day'
                            ) ||
                            moment().isSame(moment(guild.world.start).add(index, 'weeks'), 'day') ||
                            moment().isSame(moment(guild.world.start).add(index, 'weeks').add(6, 'days'), 'day'),
                            future_week: moment().isBefore(moment(guild.world.start).add(index, 'weeks'), 'day')
                        });
                    }

                    // Set the selected week on the current week
                    guild.selected_week = _.findWhere(guild.weeks, {editable: true});

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
                    self.loading_page = true;
                    _.each(guild.selected_rules, function(rule, index) {
                        Guild.addGuildRule(guild.id, rule)
                        .then(function(response) {
                            guild.rules.push(rule);
                            if(index === (guild.selected_rules.length - 1)) {
                                self.loading_page = false;
                            }
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

        function checkRuleEndorsementStatus(week, rule, user) {
            _.each(rule.endorsements, function(endorsement) {
                endorsement.rule_id = endorsement.rule.id;
            });

            var endorsement = _.findWhere(rule.endorsements, {
                endorsed_by: self.user.id,
                week: week,
                user: user.id,
                rule_id: rule.id
            });

            return endorsement ? endorsement.rating : null;
        }

        function showPasswordPrompt() {
            self.active_password_promp = true;
            $mdDialog.show({
                controller: 'passwordProtectionController',
                controllerAs: 'passwordProtectionCtrl',
                templateUrl: 'app/components/password_protection/password_protection.html',
                targetEvent: event,
                clickOutsideToClose: true,
                locals: {
                    reason: 'Deze pagina bevat gevoelige informatie en is daarom beveiligd met een wachtwoord.'
                }
            })
            .then(function(result) {
                self.active_password_promp = false;
                if(!result) {
                    self.need_password = true;
                    return Notifications.simpleToast('Please enter a password');
                }

                if(md5(result) === self.user.password) {
                    self.password_protection = false;
                } else {
                    self.need_password = true;
                    Notifications.simpleToast('Incorrect password');
                }

            }, function() {
                // Cancel dialog
                self.active_password_promp = false;
                self.need_password = true;
            });
        }

        function setRating(week, rule, user, rating, event) {
            var endorsement = _.findWhere(rule.endorsements, {
                endorsed_by: self.user.id,
                week: week,
                user: user.id,
                rule_id: rule.id
            });

            // Adding in some fun for the users
            if(Math.round(Math.random() * 4) === 1) {
                self.showBurst({
                  x: event.originalEvent.pageX - event.originalEvent.offsetX + 12,
                  y: event.originalEvent.pageY - event.originalEvent.offsetY + 12
                });
            }

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

        function showBurst(position) {
          burst.tune(position);
          timeline.replay();
        }

    }
}());
