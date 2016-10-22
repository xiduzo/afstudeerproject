(function () {
    'use strict';

    angular
        .module('cmd.base')
        .controller('BaseController', BaseController);

    /** @ngInject */
    function BaseController(
        localStorageService,
        $rootScope
    ) {

        var self = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        self.user = $rootScope.Global.getUser();
        self.access = $rootScope.Global.getAccess();

        if(false) {
            webgazer.setGazeListener(function(data, elapsedTime) {
                if (data === null) { return; }

                // console.log(elapsedTime); //elapsed time is based on time since begin was called
                $('#webgazer__point').css({
                    top: data.y,
                    left: data.x,
                    display: 'block',
                    position: 'absolute',
                    width: '30px',
                    height: '30px',
                    background: 'red',
                    zIndex: 999,
                    borderRadius: '50%'
                });
            }).begin();
        }

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    }

}());
