'use strict';

angular.module('clientApp').controller('SsidCtrl', function ($scope, $routeParams, ssidService) {
	$scope.ssid = $routeParams.ssid;
    $scope.pagination = {
        total: 0,
        pageSize: 10,
        currentPage: 1,
        first: 0,
        changed: function(){
            this.first = (this.currentPage - 1) * this.pageSize;
        }
    };
	if($scope.ssid){
		// Find entries for an SSID
		$scope.fromAddresses = [];
		ssidService.getSSIDAddresses($scope.ssid).then(function(response){
			$scope.fromAddresses = response.data;
			$scope.pagination.total = response.data.length;
		});
	}
	else{
		// Find all SSIDs	
	    $scope.ssids = [];
	    ssidService.getSSIDs().then(function(response){
	    	$scope.ssids = response.data;
	    	$scope.pagination.total = response.data.length;
	    });
	}
  });
