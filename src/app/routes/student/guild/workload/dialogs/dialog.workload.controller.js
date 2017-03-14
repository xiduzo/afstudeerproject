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
            Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function roundToDecimalPoint(num, decimal) {
            return parseFloat(num.toFixed(decimal));
        }

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function close() {
            $mdDialog.hide();
        }

        function prepareGraphData() {
            self.guild.categories = [];
            for(var index = 0; index <= self.guild.world.course_duration - 1; index++ ) {
                // Only show weeks that have been in the past
                if(!moment().isBefore(moment(self.guild.world.start).add(index, 'weeks'), 'day')) {
                    self.guild.categories.push('Week ' + (index + 1) );
                }
            }
            _.each(self.guild.categories, function(categories, index) {
                var count_member = 0;
                var count_average = 0;

                // Check if now is before of this weeks' start
                if(moment().isBefore(moment(self.guild.world.start).add(index, 'weeks'), 'day')) {
                  self.series[0].data.push(null);
                  self.series[1].data.push(null);
                } else {
                  // Build the graph for the user clicked on
                  _.each(self.member.cards, function(card) {
                      if(card.done) {
                          if(
                              moment(card.dateLastActivity).isBetween(
                                  moment(self.guild.world.start).add(index, 'weeks'),
                                  moment(self.guild.world.start).add(index+1, 'weeks'), 'day'
                              ) ||
                              moment(card.dateLastActivity).isSame(moment(self.guild.world.start).add(index, 'weeks'), 'day') ||
                              moment(card.dateLastActivity).isSame(moment(self.guild.world.start).add(index, 'weeks').add(6, 'days'), 'day')
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
                                      moment(self.guild.world.start).add(index+1, 'weeks'),
                                      'day'
                                  ) ||
                                  moment(card.dateLastActivity).isSame(moment(self.guild.world.start).add(index, 'weeks'), 'day') ||
                                  moment(card.dateLastActivity).isSame(moment(self.guild.world.start).add(index, 'weeks').add(6, 'days'), 'day')
                              ) {
                                  count_average++;
                              }
                          }
                      });
                  });
                  self.series[1].data.push(roundToDecimalPoint((count_average+count_member) / (self.others.length + 1), 1));
                }
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
