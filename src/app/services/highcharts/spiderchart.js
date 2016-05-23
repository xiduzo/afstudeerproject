(function () {
    'use strict';

    angular
        .module('cmd.services')
        .factory('Spiderchart', Spiderchart);

    /** @Spiderchart */
    function Spiderchart(
        Global
    ) {

        var service = this;

        service.createChart = createChart;

        return service;

        function createChart(selector, title, size, categories, series, tooltip, animation, credits) {

            Highcharts.chart(selector, {
                chart: {
                    polar: true,
                    type: 'area',
                    backgroundColor:'rgba(255, 255, 255, 0)',
                    spacingBottom: 10,
                    spacingTop: 10,
                    spacingLeft: 10,
                    spacingRight: 10,
                    width: 400,
                    height: 400,
                },

                exporting: {
                    // Only show the exporting button when you have a higher access level than the student
                    enabled: Global.getAccess() > 1 ? true : false,
                    backgroundColor: 'rgba(255, 255, 255, 0)'
                },

                legend: {
                   enabled: false
                },

                title: {
                    text: title
                },

                pane: {
                    size: size+'%'
                },

                tooltip: tooltip,

                xAxis: {
                    categories: categories,
                    tickmarkPlacement: 'on',
                    lineWidth: 0
                },

                yAxis: {
                    gridLineInterpolation: 'polar',
                    lineWidth: 0,
                    min: 0,
                    max: 100,
                    tickInterval : 100 / 4
                },

                series: series,

                credits: credits
            });
        }

    }

}());
