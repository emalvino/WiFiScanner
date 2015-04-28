'use strict';

angular.module('clientApp').service('scanService', function($http, $localStorage){
	return {
		getScanStatus: function(testUrl){
			var url = testUrl || $localStorage.serverUrl; 
			return $http.get(url + '/scan');
		},
		startScan: function(type){
			var url = $localStorage.serverUrl + '/scan/' + type;
			return $http.get(url);
		},
		stopScan: function(){
			return this.startScan('stop');
		}
	};
});