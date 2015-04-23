'use strict';

angular.module('clientApp').service('ssidService', function($http, $q, $localStorage){
	return {
		getSSIDs: function(){
			return $http.get($localStorage.serverUrl + '/ssid');
		},
		getSSIDAddresses: function(ssid){
			return $http.get($localStorage.serverUrl + '/ssid/' + ssid);
		}
	};
});