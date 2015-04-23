'use strict';

angular.module('clientApp').service('sessionService', function($http, $localStorage){
	return {
		getSessions: function(){
			return $http.get($localStorage.serverUrl + '/session');
		},
		getSession: function(number){
			return $http.get($localStorage.serverUrl + '/session/' + number);
		},
		saveSession: function(session){
			return $http.post($localStorage.serverUrl + '/session/' + session.number, session);
		}
	};
});