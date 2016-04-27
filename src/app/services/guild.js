(function () {
    'use strict';

    angular
        .module('cmd.services')
        .factory('Guild', Guild);

    /** @ngInject */
    function Guild(Account) {

        var service = this;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Methods
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        service.getGuilds = getGuilds;
        service.addGuild = addGuild;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            Variables
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


        return service;

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		      Method Declarations
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        function getGuilds(worldId) {
            console.log('get guilds from world id '+ worldId);
        }

        function addGuild(name) {

        }
    }

}());