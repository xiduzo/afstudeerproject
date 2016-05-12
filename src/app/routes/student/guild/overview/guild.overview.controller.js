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

        if(Global.getAccess() !== STUDENT_ACCESS_LEVEL) {
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
        Guild.getUserGuilds(self.user.uid)
            .then(function(response) {
                _.each(response, function(guild) {
                    guild.members = [];
                    self.guilds.push(guild);
                    Guild.getGuildMembers(guild.uuid)
                        .then(function(response) {
                            _.each(response, function(member) {
                                guild.members.push(member);
                            });

                            // Create the experience table shit
                            self.createExperienceChart(guild);
                        }, function() {
                            // Err
                        });
                });
            }, function() {
                // Err
            });

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function createExperienceChart(guild) {
            $('#'+guild.uuid).highcharts({

                chart: {
                    backgroundColor: 'rgba(0,0,0,0)'
                },

                title: {
                    text: 'Experience for ' +guild.name,
                    x: -20 //center
                },

                xAxis: {
                    title: {
                        text: 'Weken'
                    },
                    categories: ['Week 0', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Herkansing']
                },

                yAxis: {
                    title: {
                        text: 'Experience'
                    },
                    plotLines: [{
                        value: 55000,
                        width: 1,
                        color: '#808080',
                        label: {
                            text: 'Minimal experience needed to pass'
                        }
                    }],
                    // TODO
                    // Set max exp for a grade 10
                    min: 0,
                    max: 100000
                },

                exporting: {
                    // Only show the exporting button when you have a higher access level than the student
                    enabled: false,
                },

                legend: {
                    enabled: false
                },

                tooltip: {
                    shared: false,
                    pointFormat: 'Experience: <strong>{point.y:,.0f}</strong>'
                },

                series: [
                    {
                        name: 'dase_data',
                        color: 'rgba(0,0,0,0)',
                        data: [
                            -1, -1, -1, -1, -1, -1, -1, -1
                        ]
                    },
                    {
                        name: guild.name,
                        data: [
                            0,
                            Math.floor(Math.random() * 10000 ),
                            Math.floor(Math.random() * 5000 + 5000),
                            Math.floor(Math.random() * 10000 + 10000),
                            Math.floor(Math.random() * 15000 + 15000),
                            Math.floor(Math.random() * 20000 + 20000),
                            Math.floor(Math.random() * 40000 + 40000),
                            Math.floor(Math.random() * 40000 + 60000),
                        ],
                        color: '#FFCC00'
                    }
                ]
            });
        }

    }

}());
