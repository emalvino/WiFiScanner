'use strict';

angular.module('clientApp').controller('EntriesCtrl', function ($scope, $routeParams, entryService) {
    $scope.ssids = {};
    $scope.from = $routeParams.mac;
    entryService.getAddressEntries($scope.from).then(function(response){
    	angular.forEach(response.data, function(entry){
    		var ssid = $scope.ssids[entry.ssid];
    		if(!ssid){
    			ssid = {
    				collapsed: true,
    				entries: []
    			};
    			$scope.ssids[entry.ssid] = ssid;
    		}
    		ssid.entries.push(entry);
    	});
    });
    $scope.isBroadcast = function(mac){
        return mac === 'ff:ff:ff:ff:ff:ff';
    };
});
