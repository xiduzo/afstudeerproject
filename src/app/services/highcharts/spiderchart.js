(function () {
    'use strict';

    angular
        .module('cmd.services')
        .factory('Spiderchart', Spiderchart);

    /** @ngInject */
    function Spiderchart(
        Global
    ) {

        var service = this;

        service.createChart = createChart;

        return service;

        function createChart(selector, title, categories, series) {
            $('#'+selector).highcharts({
                chart: {
                    polar: true,
                    type: 'area',
                    spacingBottom: 10,
                    spacingTop: 10,
                    spacingLeft: 10,
                    spacingRight: 10,
                    width: 400,
                    height: 400,
                },

                title: {
                    text: title
                },

                exporting: {
                    // Only show the exporting button when you have a higher access level than the student
                    enabled: Global.getAccess() > 1 ? true : false,
                    backgroundColor: 'rgba(255, 255, 255, 0)'
                },

                pane: {
                    size: '65%'
                },

                xAxis: {
                    categories: categories,
                    tickmarkPlacement: 'on',
                    lineWidth: 0,
                },

                yAxis: {
                    gridLineInterpolation: 'polar',
                    lineWidth: 0,
                    min: 0,
                    max: 100,
                    tickInterval : 100 / 4
                },

                tooltip: {
                    shared: true,
                    pointFormat: '{series.name}: <strong>{point.y:,.0f}</strong> <br/>'
                },

                legend: {
                   enabled: false
                },

                plotOptions: {
                    series: {
                        animation: false
                    }
                },

                series: series,

                credits: {
                    text: 'Skill requirements for ' + (self.formInput.name ? self.formInput.name : 'unknown quest'),
                    href: ''
                }

            });
        }


    }

}());
