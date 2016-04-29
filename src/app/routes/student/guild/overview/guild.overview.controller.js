(function () {
    'use strict';

    angular
        .module('cmd.guild')
        .controller('GuildOverviewController', GuildOverviewController);

    /** @ngInject */
    function GuildOverviewController(
        Global,
        STUDENT_ACCESS_LEVEL
    ) {

        var vm = this;

        if(Global.getAccess() !== STUDENT_ACCESS_LEVEL) {
            Global.notAllowed();
            return;
        }

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    }

}());
