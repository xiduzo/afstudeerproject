(function () {
    'use strict';

    angular
        .module('cmd.guild')
        .controller('GuildOverviewController', GuildOverviewController);

    /** @ngInject */
    function GuildOverviewController(
        Guild,
        Global,
        STUDENT_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < STUDENT_ACCESS_LEVEL) {
            Global.notAllowed();
            return;
        }

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.createExperienceChart = createExperienceChart;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.guilds = [];

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Guild.getUserGuilds(self.user.id)
            .then(function(response) {
                _.each(response.guilds, function(guild) {

                    self.guilds.push(guild.guild);

                    setTimeout(function () {
                        self.createExperienceChart(guild.guild.id);
                    }, 100);
                });
            }, function() {
                // Err
            });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        var exp_data = [];
        var quest_points = [];
        var categories = [];
        var weeknumber = 0;

        quest_points = [
            1000, 1000, 970, 940, 930, 930, 930,
            930, 930, 840, 840, 840, 760, 730,
            700, 700, 700, 700, 600, 600, 600,
            600, 600, 580, 520, 420, 420, 420,
            420, 420, 420, 400, 400, 300, 200,
            200, 200, 200, 200, 150, 150, 150,
            150, 150, 150, 150, 150, 150, 100,
            100
        ];

        exp_data = [
            0, 20, 60, 60, 60, 60, 60,
            140, 155, 140, 140, 140, 140, 140,
            200, 230, 245, 245, 245, 245, 245,
            245, 270, 280, 280, 280, 280, 280,
            400, 430, 430, 430, 430, 430, 430,
            570, 580, 590, 590, 590, 590, 590,
            750, 780, 760, 760, 760, 760, 760,
            760
        ];

        for(var c = 0; c <= 49; c++) {
            if(c === 0 || c % 7 === 0) {
                categories.push('Week ' + weeknumber);
                weeknumber++;
            } else {
                categories.push(c);
            }
        }

        function createExperienceChart(guild) {
            $('#'+guild).highcharts({

                chart: {
                    backgroundColor: 'rgba(0,0,0,0)'
                },

                title: {
                    text: 'Progress'
                },

                xAxis: {
                    title: {
                        text: 'Dagen'
                    },
                    categories: categories
                },

                yAxis: [
                    {
                        title: {
                            text: 'Experience'
                        },
                        min: 0
                    },
                    {
                        title: {
                            text: 'Remaning quest points'
                        },
                        min: 0,
                        opposite: true
                    },
                ],

                exporting: {
                    // Only show the exporting button when you have a higher access level than the student
                    enabled: false,
                },

                legend: {
                    enabled: false
                },

                tooltip: {
                    shared: false,
                    pointFormat: '{series.name}: <strong>{point.y:,.0f}</strong>'
                },

                series: [
                    {
                        name: 'Experience',
                        data: exp_data,
                        color: '#FFCC00'
                    },
                    {
                        name: 'Remaining quest points',
                        data: quest_points,
                        color: '#cd2327',
                        yAxis: 1
                    }
                ],

                credits: {
                    text: moment().format("DD/MM/YY HH:MM"),
                    href: ''
                }
            });
        }

    }

}());
