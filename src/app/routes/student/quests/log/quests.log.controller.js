(function () {
    'use strict';

    angular
        .module('cmd.quests')
        .controller('QuestsLogController', QuestsLogController);

    /** @ngInject */
    function QuestsLogController(
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
