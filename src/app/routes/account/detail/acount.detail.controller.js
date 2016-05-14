(function () {
    'use strict';

    angular
        .module('cmd.account')
        .controller('AccountDetailController', AccountDetailController);

    /** @ngInject */
    function AccountDetailController(
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

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();
        self.average_score = {
            name: 'Average score',
            data: [
                Math.floor(Math.random() * 100),
                Math.floor(Math.random() * 100),
                Math.floor(Math.random() * 100),
                Math.floor(Math.random() * 100),
                Math.floor(Math.random() * 100)
            ],
            color: '#95a5a6',
            pointPlacement: 'on'
        };

        self.my_score = {
            name: 'My score',
            data: [
                Math.floor(Math.random() * 100),
                Math.floor(Math.random() * 100),
                Math.floor(Math.random() * 100),
                Math.floor(Math.random() * 100),
                Math.floor(Math.random() * 100)
            ],
            color: '#FFCC00',
            pointPlacement: 'on'
        };

        $('#container').highcharts({
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

            title: {
                text: ''
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
                categories: [
                    'Interaction Design',
                    'Visual Interface Design',
                    'Frontend Development',
                    'Content management',
                    'Project management'
                ],
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

            series: [self.average_score, self.my_score],

            credits: {
                text: moment().format("DD/MM/YY HH:MM"),
                href: ''
            }

        });


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    }

}());
