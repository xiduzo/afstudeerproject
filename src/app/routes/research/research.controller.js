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

            $('#moscow').highcharts({
               chart: {
                   type: 'scatter',
                   zoomType: 'xy',
                   width: 800,
                   height: 800
               },
               title: {
                   text: 'MoSCoW*'
               },
               subtitle: {
                   text: '*random order'
               },
               xAxis: {
                    min: 0,
                    max: 100,
                    lineWidth: 0,
                    gridLineWidth: 0,
                    tickWidth: 0,
                    plotBands: [
                        {
                            zIndex: 4,
                            color: Highcharts.Color('#f44336').setOpacity(0.1).get(), // Color value
                            from: 0, // Start of the plot band
                            to: 50, // End of the plot band
                            label: {
                                text: 'Must have', // Content of the label.
                                align: 'left', // Positioning of the label.
                                x: 125, // Amount of pixels the label will be repositioned according to the alignment.
                                y: 175,
                                style: {
                                    fontSize: 20,
                                    fontWeight: 'bold',
                                }
                            }
                        },
                        {
                            zIndex: 4,
                            color: Highcharts.Color('#4CAF50').setOpacity(0.1).get(), // Color value
                            from: 50, // Start of the plot band
                            to: 100, // End of the plot band
                            label: {
                                text: 'Should have', // Content of the label.
                                align: 'left', // Positioning of the label.
                                x: 125, // Amount of pixels the label will be repositioned according to the alignment.
                                y: 175,
                                style: {
                                    fontSize: 20,
                                    fontWeight: 'bold',
                                }
                            }
                        },
                    ],
               },
               yAxis: {
                   min: 0,
                   max: 100,
                   lineWidth: 0,
                   gridLineWidth: 0,
                   title: {
                       text: ''
                   },
                   plotBands: [
                       {
                           zIndex: 4,
                           color: Highcharts.Color('#2196F3').setOpacity(0.1).get(), // Color value
                           from: 0, // Start of the plot band
                           to: 50, // End of the plot band
                           label: {
                               text: 'Could have', // Content of the label.
                               align: 'left', // Positioning of the label.
                               x: 125, // Amount of pixels the label will be repositioned according to the alignment.
                               y: 0,
                               style: {
                                   fontSize: 20,
                                   fontWeight: 'bold',
                               }
                           },
                       },
                       {
                           zIndex: 4,
                           from: 50, // Start of the plot band
                           to: 100, // End of the plot band
                           label: {
                               text: 'Won\'t have', // Content of the label.
                               align: 'left', // Positioning of the label.
                               x: 500, // Amount of pixels the label will be repositioned according to the alignment.
                               y: 325,
                               style: {
                                   fontSize: 20,
                                   fontWeight: 'bold',
                               }
                           }
                       },
                   ],
               },
               plotOptions: {
                   scatter: {
                       marker: {
                           radius: 10,
                       },
                       tooltip: {
                           headerFormat: '<b>{series.name}</b><br>',
                           pointFormat: '{point.name}'
                       }
                   }
               },
               series: [
                   {
                   name: 'CMD',
                   color: '#ffcc00',
                   data: [
                       {
                           x: Math.random() * 45 + 2, y: Math.random() * 45 + 52,
                           name: 'Klassen aanmaken'
                       },
                       {
                           x: Math.random() * 45 + 2, y: Math.random() * 45 + 2,
                           name: 'Klassen geimporteerd'
                       },
                       {
                           x: Math.random() * 45 + 2, y: Math.random() * 45 + 52,
                           name: 'Groepen aanmaken'
                       },
                       {
                           x: Math.random() * 45 + 2, y: Math.random() * 45 + 52,
                           name: 'Groepen wijzigen'
                       },
                       {
                           x: Math.random() * 45 + 2, y: Math.random() * 45 + 2,
                           name: 'Avatar'
                       },
                       {
                           x: Math.random() * 45 + 2, y: Math.random() * 45 + 52,
                           name: 'Punten verzamelen in de les'
                       },
                       {
                           x: Math.random() * 45 + 2, y: Math.random() * 45 + 52,
                           name: 'Privileges unlocken'
                       },
                       {
                           x: Math.random() * 45 + 2, y: Math.random() * 45 + 52,
                           name: 'Wekelijks individueel beoordelen'
                       },
                       {
                           x: Math.random() * 45 + 2, y: Math.random() * 45 + 52,
                           name: 'Wekelijks individueel monitoren'
                       },
                       {
                           x: Math.random() * 45 + 2, y: Math.random() * 45 + 52,
                           name: 'Regels opstellen'
                       },
                       {
                           x: Math.random() * 45 + 2, y: Math.random() * 45 + 2,
                           name: 'Content (les materiaal) uploaden'
                       },
                       {
                           x: Math.random() * 45 + 2, y: Math.random() * 45 + 2,
                           name: 'Onderling messaging'
                       },
                       {
                           x: Math.random() * 45 + 2, y: Math.random() * 45 + 2,
                           name: 'Leveling system'
                       },
                       {
                           x: Math.random() * 45 + 2, y: Math.random() * 45 + 2,
                           name: 'Some sort of GP (editing your character)'
                       },
                       {
                           x: Math.random() * 45 + 52, y: Math.random() * 45 + 2,
                           name: 'Punten verliezen (negatieve stimulans)'
                       },
                       {
                           x: Math.random() * 45 + 2, y: Math.random() * 45 + 52,
                           name: 'Regels kunnen toepassen'
                       },
                   ]

                   // Must have
                   // x: Math.random() * 45 + 2, y: Math.random() * 45 + 52,
                   // Should have
                   // x: Math.random() * 45 + 52, y: Math.random() * 45 + 52,
                   // Could have
                   // x: Math.random() * 45 + 2, y: Math.random() * 45 + 2,
                   // Wont have have
                   // x: Math.random() * 45 + 52, y: Math.random() * 45 + 2,
                },
                {
                   name: 'Studenten',
                   color: '#E91E63',
                   data: [
                       {
                           x: Math.random() * 45 + 2, y: Math.random() * 45 + 52,
                           name: 'Duidelijke eisen'
                       },
                       {
                           x: Math.random() * 45 + 2, y: Math.random() * 45 + 2,
                           name: 'Een systeem'
                       },
                       {
                           x: Math.random() * 45 + 52, y: Math.random() * 45 + 52,
                           name: 'Beter / vaker feedback'
                       },
                       {
                           x: Math.random() * 45 + 2, y: Math.random() * 45 + 52,
                           name: 'ClassCraft verbeteren'
                       },
                       {
                           x: Math.random() * 45 + 2, y: Math.random() * 45 + 52,
                           name: 'Docenten die een platform actief inzetten'
                       },
                       {
                           x: Math.random() * 45 + 52, y: Math.random() * 45 + 52,
                           name: 'Individueel presteren beoordelen'
                       },
                       {
                           x: Math.random() * 45 + 2, y: Math.random() * 45 + 2,
                           name: 'Eigen team kunnen samenstellen'
                       },
                       {
                           x: Math.random() * 45 + 2, y: Math.random() * 45 + 52,
                           name: 'Werken in groepsverband'
                       },
                       {
                           x: Math.random() * 45 + 52, y: Math.random() * 45 + 52,
                           name: 'Betere verdeling teams'
                       },
                       {
                           x: Math.random() * 45 + 2, y: Math.random() * 45 + 52,
                           name: 'Zelfde beoordeling tussen verschillende klassen'
                       },
                       {
                           x: Math.random() * 45 + 52, y: Math.random() * 45 + 2,
                           name: 'Classcraft afschaffen'
                       },
                       {
                           x: Math.random() * 45 + 52, y: Math.random() * 45 + 2,
                           name: 'Docenten vervangen (betere docenten)'
                       },
                       {
                           x: Math.random() * 45 + 52, y: Math.random() * 45 + 2,
                           name: 'Lessen verkorten'
                       },
                       {
                           x: Math.random() * 45 + 52, y: Math.random() * 45 + 52,
                           name: 'Log van alles wat er is gebeurd in het platform voor mij'
                       },
                       {
                           x: Math.random() * 45 + 2, y: Math.random() * 45 + 52,
                           name: 'Regels kunnen opstellen voor team'
                       },
                   ]

                   // Must have
                   // x: Math.random() * 45 + 2, y: Math.random() * 45 + 52,
                   // Should have
                   // x: Math.random() * 45 + 52, y: Math.random() * 45 + 52,
                   // Could have
                   // x: Math.random() * 45 + 2, y: Math.random() * 45 + 2,
                   // Wont have have
                   // x: Math.random() * 45 + 52, y: Math.random() * 45 + 2,
               },
                {
                   name: 'Sander',
                   color: '#2196F3',
                   data: [
                       {
                           x: Math.random() * 45 + 2, y: Math.random() * 45 + 52,
                           name: 'Reusable code'
                       },
                       {
                           x: Math.random() * 45 + 2, y: Math.random() * 45 + 52,
                           name: 'Scheiding frontend & backend'
                       },
                       {
                           x: Math.random() * 45 + 52, y: Math.random() * 45 + 52,
                           name: 'Backend werkend online'
                       },
                       {
                          x: Math.random() * 45 + 2, y: Math.random() * 45 + 2,
                           name: 'Python'
                       },
                       {
                           x: Math.random() * 45 + 52, y: Math.random() * 45 + 52,
                           name: 'User testing'
                       },
                       {
                           x: Math.random() * 45 + 52, y: Math.random() * 45 + 2,
                           name: 'The best visual interface'
                       },
                       {
                           x: Math.random() * 45 + 52, y: Math.random() * 45 + 52,
                           name: 'Decent UI'
                       },
                   ]

                  // Must have
                  // x: Math.random() * 45 + 2, y: Math.random() * 45 + 52,
                  // Should have
                  // x: Math.random() * 45 + 52, y: Math.random() * 45 + 52,
                  // Could have
                  // x: Math.random() * 45 + 2, y: Math.random() * 45 + 2,
                  // Wont have have
                  // x: Math.random() * 45 + 52, y: Math.random() * 45 + 2,
               },
                ],
               credits: {
                   text: 'Sander Boer, Afstuderen 2015/2016',
                   href: ''
               }
           });

       }

    }

}());
