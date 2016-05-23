(function () {
    'use strict';

    angular
        .module('cmd.account')
        .controller('AccountDetailController', AccountDetailController);

    /** @ngInject */
    function AccountDetailController(
        Global,
        Highchart,
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

        // Chart options
        var average_score = {
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

        var my_score = {
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

        var skills = [
            'Interaction Design',
            'Visual Interface Design',
            'Frontend Development',
            'Content management',
            'Project management'
        ];

        var credits = {
            text: moment().format("DD/MM/YY HH:MM"),
            href: ''
        };

        var tooltip = {
            shared: true,
            pointFormat: '{series.name}: <strong>{point.y:,.0f}</strong> <br/>'
        };

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Services
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        Highchart.spiderChart('container', '', 65, skills, [average_score, my_score], tooltip, true, credits);



        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    }

}());
