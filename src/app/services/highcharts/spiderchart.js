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

        function createChart(selector, title, width, height, size, series, tooltip, animation, credits) {
            Highcharts.chart(selector, {
                chart: {
                    polar: true,
                    type: 'area',
                    backgroundColor:'rgba(255, 255, 255, 1)',
                    spacingBottom: 15,
                    spacingTop: 15,
                    spacingLeft: 15,
                    spacingRight: 15,
                    width: width,
                    height: height,
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

                plotOptions: {
                    series: {
                        animation: animation
                    }
                },

                tooltip: {
                    shared: tooltip,
                    pointFormat: '{series.name}: <strong>{point.y:,.0f}</strong> <br/>'
                },

                xAxis: {
                    categories: [
                        'Interaction Design',
                        'Visual Interface Design',
                        'Frontend Development',
                        // 'Content management',
                        // 'Project management'
                    ],
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
