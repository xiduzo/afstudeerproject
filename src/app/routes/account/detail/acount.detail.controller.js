(function () {
    'use strict';

    angular
        .module('cmd.account')
        .controller('AccountDetailController', AccountDetailController);

    /** @ngInject */
    function AccountDetailController(
        $state,
        Global,
        Guild,
        Quest,
        World,
        CMDChart,
        Spiderchart,
        TrelloApi,
        Notifications,
        localStorageService,
        STUDENT_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < STUDENT_ACCESS_LEVEL) {
            Global.notAllowed();
            return;
        }

        Global.setRouteTitle('Profile');

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.createSpiderChart = createSpiderChart;
        self.authenticate = authenticate;
        self.selectGuild = selectGuild;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.trello_account = null;
        self.loading_page = true;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getUserGuilds(self.user.id)
        .then(function(response) {
            self.user.guilds = [];
            _.each(response.guilds, function(guild) {
                self.user.guilds.push(guild.guild);
            });

            if(localStorage.getItem('trello_token')) {
                TrelloApi.Authenticate()
                .then(function(response) {
                    TrelloApi.Rest('GET', 'members/me')
                    .then(function(response) {
                        self.trello_account = response;
                        self.loading_page = false;

                        setTimeout(function () {
                            var user = {
                                techniek: Math.random() * 30 + 40,
                                interaction: Math.random() * 30 + 40,
                                visual: Math.random() * 30 + 40
                            };

                            CMDChart.createChart('cmdChart', user, 'small');
                        }, 100);
                    });
                });
            } else {
                self.authenticate();
            }

        }, function(error) {
            // Error get user guilds
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function createSpiderChart(average, my_scores) {

        }

        function authenticate() {
            if(localStorage.getItem('trello_token')) {
                localStorage.removeItem('trello_token');
            }

            TrelloApi.Authenticate()
            .then(function(){
                console.log(true);
                TrelloApi.Rest('GET', 'members/me')
                .then(function(response) {
                    self.trello_account = response;
                    localStorageService.set('trello_user', response);
                    Notifications.simpleToast('Authentication succeeded');
                    self.loading_page = false;
                });
            }, function(){
                Notifications.simpleToast('Authentication failed');
            });
        }

        function selectGuild(guild) {
            Global.setSelectedGuild(guild.id);
            $state.go('base.home.dashboards.student');
        }

    }

}());
