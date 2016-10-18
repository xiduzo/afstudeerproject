(function () {
    'use strict';

    angular
        .module('cmd.guilds')
        .controller('GuildDetailFeedbackController', GuildDetailFeedbackController);

    /** @ngInject */
    function GuildDetailFeedbackController(
        $stateParams,
        $filter,
        Global,
        Guild,
        World,
        LECTURER_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < LECTURER_ACCESS_LEVEL) {
            Global.notAllowed();
            return;
        }

        Global.setRouteTitle('Group feedback');
        Global.setRouteBackRoute('base.guilds.overview');

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.createChart = createChart;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.access = Global.getAccess();
        self.members_data = [];
        self.selected_member = null;
        self.loading_page = true;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getGuild($stateParams.guildUuid)
        .then(function(response) {
            Global.setRouteTitle('Group feedback', response.name);
            console.log(response);
            _.each(response.members, function(member) {
                self.members_data.push({
                    id: member.id,
                    email: member.email,
                    name: $filter('fullUserName')(member),
                    endorsements: [],
                });
            });

            self.selected_member = _.first(self.members_data);

            _.each(response.rules, function(rule) {
                _.each(rule.endorsements, function(endorsement) {
                    console.log(endorsement, rule.points);
                });
            });

            World.getWorld(response.world.id)
            .then(function(response) {
                var tempObj = {
                    duration: response.course_duration,
                    start: response.start
                };
                console.log(response);
                self.createChart();
            })
            .catch(function(error) {
                console.log(error);
            });

            self.loading_page = false;


        })
        .catch(function(error) {
            console.log(error);
        });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function createChart() {
            console.log(true);
            $('#chart').highcharts({
                chart: { type: 'spline' },
                title: {
                    text: 'Endorsement points'
                },
                subtitle: {
                text: 'May 31 and and June 1, 2015 at two locations in Vik i Sogn, Norway'
                },
                xAxis: {
                    type: 'datetime',
                    labels: {
                        overflow: 'justify'
                    }
                },
                yAxis: {
                    title: {
                        text: 'Points'
                    },
                    minorGridLineWidth: 0,
                    gridLineWidth: 1,
                    alternateGridColor: null,
                },
                tooltip: {
                    valueSuffix: ' points'
                },
                plotOptions: {
                    spline: {
                        lineWidth: 4,
                        states: {
                            hover: {
                                lineWidth: 5
                            }
                        },
                        marker: {
                            enabled: false
                        },
                        pointInterval: 3600000, // one hour
                        pointStart: Date.UTC(2015, 4, 31, 0, 0, 0)
                    }
                },
                series: [
                    {
                        name: 'Average',
                        data: [45, 35, 53, 100, 95, 130],
                        color: Highcharts.Color('#222222').setOpacity(0.1).get(),
                    },
                    {
                        name: 'Sander Boer',
                        data: [30, 40, 49, 69, 104, 150],
                        color: '#FFCC00'
                    },
                ],
                navigation: {
                    menuItemStyle: {
                        fontSize: '10px'
                    }
                }
            });
        }
    }

}());
