(function () {
    'use strict';

    angular
        .module('cmd.guild')
        .controller('memberWorkloadController', memberWorkloadController);

    /** @ngInject */
    function memberWorkloadController(
        $mdDialog,
        member,
        others,
        guild,
        Global
    ) {

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.close = close;
        self.showGraph = showGraph;
        self.prepareGraphData = prepareGraphData;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.member = member;
        self.others = others;
        self.guild = guild;
        self.series = [
            {
                name: self.member.name,
                color: self.member.color,
                data: [],
            },
            {
                name: 'Gemiddeld',
                color: Highcharts.Color('#000000').setOpacity(0.1).get(),
                data: [],
            }
        ];

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.prepareGraphData();

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function close() {
            $mdDialog.hide();
        }

        function prepareGraphData() {
            self.guild.categories = [];
            for(var i = 0; i <= self.guild.world.course_duration - 1; i++ ) {
                self.guild.categories.push('Week ' + (i + 1) );
            }

            _.each(self.guild.categories, function(categories, index) {
                var count_member = 0;
                var count_average = 0;

                // Build the graph for the user clicked on
                _.each(self.member.cards, function(card) {
                    if(card.done) {
                        if(
                            moment(card.dateLastActivity).isBetween(
                                moment(self.guild.world.start).add(index, 'weeks'),
                                moment(self.guild.world.start).add(index+1, 'weeks'), 'day'
                            ) || moment(card.dateLastActivity).isSame(moment(self.guild.world.start).add(index, 'weeks'), 'day')
                        ) {
                            count_member++;
                        }
                    }
                });
                self.series[0].data.push(count_member);

                // Build the graph for the average
                _.each(self.others, function(other) {
                    _.each(other.cards, function(card) {
                        if(card.done) {
                            if(
                                moment(card.dateLastActivity).isBetween(
                                    moment(self.guild.world.start).add(index, 'weeks'),
                                    moment(self.guild.world.start).add(index+1, 'weeks'), 'day'
                                ) || moment(card.dateLastActivity).isSame(moment(self.guild.world.start).add(index, 'weeks'), 'day')
                            ) {
                                count_average++;
                            }
                        }
                    });
                });
                self.series[1].data.push((count_average+count_member) / (self.others.length + 1));
            });

            setTimeout(function () {
                self.showGraph();
            }, 100);
        }

        function showGraph(categories) {
            Highcharts.chart('workload__graph', {
                title: {
                    text: member.name
                },
                xAxis: {
                    categories: self.guild.categories,
                    crosshair: true
                },
                yAxis: {
                    title: {
                        text: 'Voltooide kaarten'
                    }
                },
                tooltip: {
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td>{series.name}: </td><td><b style="padding: 0 4px;">{point.y}</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0
                    },
                    series: {
                        animation: false
                    }
                },
                series: self.series,
                exporting: { enabled: Global.getAccess() > 1 ? true : false, },
                credits: {
                    text: moment().format("DD/MM/YY HH:MM"),
                    href: ''
                }
            });
        }


    }
}());
