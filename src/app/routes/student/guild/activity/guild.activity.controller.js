(function () {
    'use strict';

    angular
        .module('cmd.guild')
        .controller('GuildActivityController', GuildActivityController);

    /** @ngInject */
    function GuildActivityController(
        Global,
        STUDENT_ACCESS_LEVEL
    ) {

        if(Global.getAccess() < STUDENT_ACCESS_LEVEL) {
            return Global.notAllowed();
        }

        var self = this;


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = Global.getUser();

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Extra logic
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    }

}());
