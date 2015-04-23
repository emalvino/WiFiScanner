'use strict';

angular.module('clientApp').service('entryService', function($http, $q, $localStorage){
	return {
		getAddressEntries: function(address){
			return $http.get($localStorage.serverUrl + '/entry/' + address);
		}
	};
});