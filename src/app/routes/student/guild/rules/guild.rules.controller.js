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
        toastr,
        localStorageService,
        STUDENT_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < STUDENT_ACCESS_LEVEL) {
            return Global.notAllowed();
        }

        Global.setRouteTitle('Feedback');
        Global.setRouteBackRoute(null);

        var vm = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        vm.toggleRule = toggleRule;
        vm.removeRule = removeRule;
        vm.addRule = addRule;
        vm.addRulesToGuild = addRulesToGuild;
        vm.checkRuleEndorsementStatus = checkRuleEndorsementStatus;
        vm.setRating = setRating;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        vm.user = Global.getUser();
        vm.selected_guild = Global.getSelectedGuild();
        vm.guilds = [];
        vm.loading_page = true;

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
          }
        });
        var timeline = new mojs.Timeline({ speed: 1.5 });
        timeline.add( burst );

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Broadcasts
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        $scope.$on('guild-changed', function(event, guild) {
            vm.selected_guild = guild;

            if(!_.findWhere(vm.guilds, { id: vm.selected_guild})) {
              // Get the guild
              getGuild(guild);
            }
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        if(!_.findWhere(vm.guilds, { id: vm.selected_guild}) && vm.selected_guild) {
          getGuild(vm.selected_guild);
        }

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function getGuild(guild) {
          Guild.getGuild(guild)
          .then(function(response) {
            vm.loading_page = false;
            guild = response;

            var local_guilds = localStorageService.get('guilds') || [];

            // // Get the rules from the localstorage
            if(_.findWhere(local_guilds, {guild: guild.id}) && moment(_.findWhere(local_guilds, {guild: guild.id}).datetime).isAfter(moment().subtract(1, 'hours'))) {
              guild.rules = _.findWhere(local_guilds, {guild: guild.id}).rules;
            } else {
              Guild.V2getGuildRules(guild.id)
              .then(function(response) {
                local_guilds = localStorageService.get('guilds') || [];
                var local_guild = _.findWhere(local_guilds, {guild: guild.id});
                var tempObj = {
                  guild: guild.id,
                  datetime: moment(),
                  rules: response.data
                };

                // Check if we need to update the local storage
                if(local_guild) {
                  local_guilds[_.indexOf(local_guilds, local_guild)] = tempObj;
                } else {
                  local_guilds.push(tempObj);
                }

                localStorageService.set('guilds', local_guilds);

                guild.rules = response.data;

              })
              .catch(function(error) {
                toastr.error(error);
              });
            }

            // Check if the guild allready has rules
            if(guild.rules.length < 8) {
              guild.requirements = {
                attitude: { selected: 0, check: false },
                functioning: { selected: 0, check: false },
                knowledge: { selected: 0, check: false },
                justification: { selected: 0, check: false }
              };
              guild.selected_rules = [];
              guild.minimun_rules_selected = false;

              Rules.getRules()
              .then(function(response) {
                guild.possible_rules = _.groupBy(response, function(rule) {
                  return rule.rule_type;
                });
              })
              .catch(function(error) {
                toastr.error(error);
              });
            }

            guild.weeks = [];

            for(var i = 0; i <= guild.world.course_duration; i++) {
              guild.weeks.push({
                index: i,
                name: (i+1),
                start: moment(guild.world.start).add(i, 'weeks'),
                end: moment(guild.world.start).add(i, 'weeks').add(6, 'days').subtract(1, 'minutes'),
                editable: moment().isBetween(
                  moment(guild.world.start).add(i, 'weeks'),
                  moment(guild.world.start).add(i, 'weeks').add(6, 'days'),
                  'day'
                ) ||
                moment().isSame(moment(guild.world.start).add(i, 'weeks'), 'day') ||
                moment().isSame(moment(guild.world.start).add(i, 'weeks').add(6, 'days'), 'day'),
                future_week: moment().isBefore(moment(guild.world.start).add(i, 'weeks'), 'day')
              });
            }

            // Get the current week
            guild.selected_week = _.findWhere(guild.weeks, {editable: true});
            vm.guilds.push(guild);

          })
          .catch(function(error) {
            toastr.error(error);
          });
        }

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function removeRule(rule, guild) {
            rule.selected = false;
            vm.toggleRule(rule, guild);
            rule = null;
            toastr.success('Afspraak verwijdert');
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
                !response.rule) {
                    return toastr.warning('Vul alle velden in');
                }

                var tempObj = {
                    points: 14,
                    rule: response.rule,
                    rule_type: response.type,
                    selected: true,
                    own_rule: true,
                };
                guild.own_rule = (tempObj);
                vm.toggleRule(tempObj, guild);

                toastr.success('Afspraak toegevoegd');
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
                    vm.loading_page = true;
                    _.each(guild.selected_rules, function(rule, index) {
                        Guild.addGuildRule(guild.id, rule)
                        .then(function(response) {
                            guild.rules.push(rule);
                            if(index === (guild.selected_rules.length - 1)) {
                                vm.loading_page = false;
                                Guild.V2getGuildRules(guild.id)
                                .then(function(response) {
                                  var local_guilds = localStorageService.get('guilds') || [];
                                  var local_guild = _.findWhere(local_guilds, {guild: guild.id});
                                  var tempObj = {
                                    guild: guild.id,
                                    datetime: moment(),
                                    rules: response.data
                                  };

                                  // Check if we need to update the local storage
                                  if(local_guild) {
                                    local_guilds[_.indexOf(local_guilds, local_guild)] = tempObj;
                                  } else {
                                    local_guilds.push(tempObj);
                                  }

                                  localStorageService.set('guilds', local_guilds);

                                  guild.rules = response.data;

                                })
                                .catch(function(error) {
                                  toastr.error(error);
                                });
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
                return endorsement.rule_id = endorsement.rule;
            });

            var endorsement = _.findWhere(rule.endorsements, {
                endorsed_by: vm.user.id,
                week: week,
                user: user.id,
                rule_id: rule.id
            });

            return endorsement ? endorsement.rating : null;
        }

        function setRating(week, rule, user, rating, guild, event) {
            var local_guilds = localStorageService.get('guilds') || [];
            var local_guild = _.findWhere(local_guilds, {guild: guild.id});

            var endorsement = _.findWhere(rule.endorsements, {
                endorsed_by: vm.user.id,
                week: week,
                user: user.id,
                rule_id: rule.id
            });

            // Adding in some fun for the users
            if(Math.round(Math.random() * 4) === 1) {
                showBurst({
                  x: event.originalEvent.pageX - event.originalEvent.offsetX,
                  y: event.originalEvent.pageY - event.originalEvent.offsetY
                });
            }

            if(endorsement) {
                Guild.patchEndorsement(endorsement.id, rating)
                .then(function(response) {
                    // Update the rating in the memory
                    endorsement.rating = response.rating;
                    toastr.success('Je feedback is opgeslagen');

                    // TODO
                    // Update the local storage
                    local_guilds[_.indexOf(local_guilds, local_guild)] = {
                      guild: guild.id,
                      datetime: moment(),
                      rules: guild.rules
                    };
                    localStorageService.set('guilds', local_guilds);
                })
                .catch(function(error) {
                    toastr.error(error);
                });
            } else {
                Guild.addEndorsement(rule.id, user.id, vm.user.id, week, rating)
                .then(function(response) {
                    // Yeah this is fucked up, bc of the ng-init for rating check
                    // but the deadline is near and i dont have a faster sollution
                    // #sorrynotsorry
                    response.rule_id = response.rule;
                    if(!rule.endorsements) {
                        rule.endorsements = [response];
                    } else {
                        rule.endorsements.push(response);
                    }

                    toastr.success('Je feedback is opgeslagen');

                    // Update the guild localstorage
                    local_guilds[_.indexOf(local_guilds, local_guild)] = {
                      guild: guild.id,
                      datetime: moment(),
                      rules: guild.rules
                    };
                    localStorageService.set('guilds', local_guilds);

                    // var local_guilds = localStorageService.get('guilds') || [];
                    // var local_guild = _.findWhere(local_guilds, {guild: guild.id});
                    // console.log(local_guild);

                })
                .catch(function(error) {
                    toastr.error(error);
                });
            }
        }

        function showBurst(position) {
          burst.tune(position);
          timeline.replay();
        }

    }
}());
