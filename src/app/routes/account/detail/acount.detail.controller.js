(function () {
    'use strict';

    angular
        .module('cmd.account')
        .controller('AccountDetailController', AccountDetailController);

    /** @ngInject */
    function AccountDetailController(
        Global,
        RadarChart,
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

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
		var data = [
            [
                {
                    axis:  "Interaction Design",
                    value: 0.73
                },
                {
                    axis:  "Visual Interface Design",
                    value: 0.6
                },
                {
                    axis:  "Frontend Development",
                    value: 0.87
                },
                {
                    axis:  "Content management",
                    value: 0.23
                },
                {
                    axis:  "Project management",
                    value: 0.04
                }
            ]
        ];

		var radarChartOptions = {
            w: 300,
            h: 300,
            margin: {top: 50, right: 50, bottom: 50, left: 75 },
            maxValue: 1,
            levels: 5,
            roundStrokes: true,
            color: d3.scale.ordinal().range(["#FFC107"])
		};

		// Draw the chart
		RadarChart.BuildChart(".radarChart", data, radarChartOptions);

        self.user = Global.getUser();


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    }

}());
