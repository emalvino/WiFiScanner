'use strict';

angular.module('clientApp').service('fromService', function($http, $q, $localStorage){
	return {
		getFromAddresses: function(){
			return $http.get($localStorage.serverUrl + '/from');
		},
		getAddressDetails: function(address){
			return $http.get($localStorage.serverUrl + '/details/' + address);
		},
		saveAddressDetails: function(address, details){
			return $http.post($localStorage.serverUrl + '/details/' + address, details);
		}
	};
});