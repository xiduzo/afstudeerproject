(function () {
    'use strict';

    angular
        .module('cmd.research')
        .controller('ResearchController', ResearchController);

    /** @ngInject */
    function ResearchController($timeout) {

        var self = this;

       var ranges = [
          ['Zeer oneens', 0.0, 83.3],
          ['Oneens', 0.0, 60.0],
          ['Eens', 0.0, 100.0],
          ['Zeer eens', 0.0, 7.7]
      ], averages = [
          ['Zeer oneens', 45.4],
          ['Oneens', 32.4],
          ['Eens', 21.0],
          ['Zeer eens', 1.1]
      ];

       $timeout(createCharts, 200);

       function createCharts() {

           $('#chart').highcharts({
               title: {
                   text: 'Het hp punten formulier samen met classcraft maakten het individueel functioneren binnen het team inzichtelijk'
               },
               xAxis: {
                   categories: ['Zeer oneens', 'Oneens', 'Eens', 'Zeer eens']
               },
               yAxis: {
                   title: {
                       text: 'Percentage'
                   },
                   min: 0,
                   max: 100
               },
               tooltip: {
                   crosshairs: true,
                   shared: true,
                   valueSuffix: '%'
               },
               legend: {
               },
               series: [
                   {
                       name: 'Gemiddeld',
                       data: averages,
                       zIndex: 1,
                       marker: {
                           fillColor: 'white',
                           lineWidth: 2,
                           lineColor: Highcharts.getOptions().colors[0]
                       }
                   },
                   {
                   name: 'Range',
                   data: ranges,
                   type: 'arearange',
                   lineWidth: 0,
                   linkedTo: ':previous',
                   color: Highcharts.getOptions().colors[0],
                   fillOpacity: 0.3,
                   zIndex: 0
                   }
               ],
               credits: {
                   text: 'Sander Boer, Afstuderen 2015/2016',
                   href: ''
               }
           });

            var colors = Highcharts.getOptions().colors,
                categories = ['ClassCraft'],
                data = [{
                    y: 100,
                    color: colors[0],
                    drilldown: {
                    name: 'classcraft',
                    categories: ['Awesome', 'Algemeen', 'Punten formulier', 'Motivatie (punten)', 'Niet zoveel gebruikt'],
                    data: [11.11, 44.44, 22.22, 11.11, 11.11],
                    color: colors[0]
                    }
                }],
                browserData = [],
                versionsData = [],
                i,
                j,
                dataLen = data.length,
                drillDataLen,
                brightness;


            // Build the data arrays
            for (i = 0; i < dataLen; i += 1) {
                // add browser data
                browserData.push({
                name: categories[i],
                y: data[i].y,
                color: data[i].color
            });

            // add version data
            drillDataLen = data[i].drilldown.data.length;
            for (j = 0; j < drillDataLen; j += 1) {
                brightness = 0.2 - (j / drillDataLen) / 5;
                versionsData.push({
                name: data[i].drilldown.categories[j],
                y: data[i].drilldown.data[j],
                color: Highcharts.Color(data[i].color).brighten(brightness).get()
                });
                }
            }

            // Create the chart
            $('#pie').highcharts({
                chart: {
                    type: 'pie'
                },
                title: {
                        text: 'Tops project 2: ClassCraft'
                },
                subtitle: {
                 text: 'Op basis van 9 antwoorden'
                },
                yAxis: {
                    title: {
                        text: 'Total percent market share'
                    }
                },
                plotOptions: {
                    pie: {
                        shadow: false,
                        center: ['50%', '50%']
                    }
                },
                tooltip: {
                    valueSuffix: ''
                },
                series: [{
                    name: '',
                    data: browserData,
                    size: '60%',
                    dataLabels: {
                    formatter: function () {
                    return this.y > 5 ? this.point.name : null;
                    },
                    color: '#ffffff',
                    distance: -90
                    }
                }, {
                    name: 'Percentage',
                    data: versionsData,
                    size: '80%',
                    innerSize: '60%',
                    dataLabels: {
                    formatter: function () {
                    // display only if larger than 1
                    return this.y > 1 ? '<b>' + this.point.name + ':</b> ' + this.y + '%' : null;
                    }
                    }
                }],
                credits: {
                    text: 'Sander Boer, Afstuderen 2015/2016',
                    href: ''
                }
            });


       }

    }

}());
