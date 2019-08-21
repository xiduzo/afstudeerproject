(function() {
  "use strict";

  angular
    .module("cmd.guilds")
    .controller("GuildSettingsController", GuildSettingsController);

  /** @ngInject */
  function GuildSettingsController(
    $mdDialog,
    $mdToast,
    $state,
    $stateParams,
    Global,
    Notifications,
    toastr,
    Guild,
    TrelloApi,
    localStorageService,
    LECTURER_ACCESS_LEVEL
  ) {
    if (Global.getAccess() < LECTURER_ACCESS_LEVEL) {
      return Global.notAllowed();
    }

    Global.setRouteTitle("Team instellingen");
    Global.setRouteBackRoute("base.guilds.overview");

    var self = this;

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			Methods
		~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    self.deleteGuild = deleteGuild;
    self.changeGuildName = changeGuildName;
    self.patchSettings = patchSettings;
    self.deleteRule = deleteRule;

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			Variables
		~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    self.guild = [];
    self.trello_boards = [];
    self.trello_board_lists = [];
    self.loading_page = true;

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			Services
		~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    Guild.getGuild($stateParams.guildUuid).then(
      function(response) {
        if (response.status === 404) {
          toastr.error("Team " + $stateParams.guildUuid + " bestaad niet");
          $state.go("base.guilds.overview");
        }
        Global.setRouteTitle("Team instellingen " + response.name);
        self.guild = response;
        getGuildRules(self.guild);
        if (!response.world.trello_user_id) {
          toastr.error("Geen trello user ingesteld");
          $state.go("base.guilds.overview");
        } else {
          TrelloApi.Authenticate().then(
            function(response) {
              TrelloApi.Rest(
                "GET",
                "members/" + self.guild.world.trello_user_id + "/boards"
              ).then(function(response) {
                self.trello_boards = response;
              });
              if (self.guild.trello_board) {
                TrelloApi.Rest(
                  "GET",
                  "boards/" + self.guild.trello_board + "/lists"
                ).then(
                  function(response) {
                    self.trello_board_lists = response;
                    self.loading_page = false;
                  },
                  function(error) {
                    // TODO
                    // Dont delete this on a 404
                    self.loading_page = false;
                    self.guild.trello_board = null;
                    self.guild.trello_done_lists = null;
                    // Make sure to delete this setting in the backend
                    // bacause the bord has been deleted
                    Guild.patchGuildSettings(self.guild)
                      .then(function(response) {
                        toastr.info(
                          "Trello bord bestaad niet meer, team is geupdate"
                        );
                      })
                      .catch(function(error) {
                        //console.log(error);
                      });
                  }
                );
              } else {
                self.loading_page = false;
              }
            },
            function(error) {
              //console.log(error);
            }
          );
        }
      },
      function() {
        // Err
      }
    );

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			Method Declarations
		~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    function getGuildRules(guild) {
      var local_guilds = localStorageService.get("guilds") || [];

      if (
        _.findWhere(local_guilds, { guild: guild.id }) &&
        moment(_.findWhere(local_guilds, { guild: guild.id }).datetime).isAfter(
          moment().subtract(1, "minutes")
        )
      ) {
        guild.rules = _.findWhere(local_guilds, { guild: guild.id }).rules;
      } else {
        Guild.V2getGuildRules(guild.id)
          .then(function(response) {
            local_guilds = localStorageService.get("guilds") || [];
            var local_guild = _.findWhere(local_guilds, { guild: guild.id });
            var tempObj = {
              guild: guild.id,
              datetime: moment(),
              rules: response.data
            };

            // Check if we need to update the local storage
            if (local_guild) {
              local_guilds[_.indexOf(local_guilds, local_guild)] = tempObj;
            } else {
              local_guilds.push(tempObj);
            }

            localStorageService.set("guilds", local_guilds);

            guild.rules = response.data;
          })
          .catch(function(error) {
            toastr.error(error);
          });
      }
    }

    function deleteGuild(event) {
      Notifications.confirmation(
        "Weet je zeker dat je dit team wilt verwijderen?",
        "Deze actie kan niet meer ongedaan worden.",
        "Verwijder team",
        event
      ).then(
        function() {
          Guild.deleteGuild(self.guild.id).then(
            function(response) {
              toastr.success("Team " + self.guild.name + " is verwijdert");
              $state.go("base.guilds.overview");
            },
            function() {
              // Err deleting guild
            }
          );
        },
        function() {
          // Nope Nope Nope Nope
        }
      );
    }

    function changeGuildName(event) {
      Notifications.prompt(
        'Wijzig teamnaam van "' + self.guild.name + '"',
        "Wat word de nieuwe naam van dit team?",
        "Team naam",
        event
      ).then(
        function(result) {
          // Checks for thw world name
          if (!result) {
            return toastr.warning("Vul een teamnaam in");
          }

          Guild.patchGuildName(result, self.guild.id).then(
            function(response) {
              toastr.success("Team naam gewijzigd naar " + result);
              self.guild.name = result;
            },
            function() {
              // Err patch guild name
            }
          );
        },
        function() {
          // Cancel
        }
      );
    }

    function patchSettings() {
      if (self.guild.trello_board) {
        TrelloApi.Rest(
          "GET",
          "boards/" + self.guild.trello_board + "/lists"
        ).then(
          function(response) {
            self.trello_board_lists = response;
          },
          function(error) {
            //console.log(error);
          }
        );
      }

      Guild.patchGuildSettings(self.guild)
        .then(function(response) {
          toastr.success("Team instellingen opgeslagen");
        })
        .catch(function(error) {
          //console.log(error);
        });
    }

    function deleteRule(rule) {
      if (Global.getLocalSettings().enabled_confirmation) {
        Notifications.confirmation(
          "Weet je zeker dat je deze regel wilt verwijderen?",
          "Deze actie kan niet meer ongedaan worden.",
          "verwijder regel",
          event
        ).then(
          function() {
            removeGuildRule(rule);
          },
          function() {
            // No
          }
        );
      } else {
        removeGuildRule(rule);
      }
    }

    function removeGuildRule(rule) {
      Guild.removeGuildRule(rule)
        .then(function(response) {
          self.guild.rules.splice(
            self.guild.rules.indexOf(
              _.findWhere(self.guild.rules, { id: rule.id })
            ),
            1
          );
          toastr.success("Regel is verwijdert");
        })
        .catch(function(error) {
          toastr.error(error);
        });
    }
  }
})();
