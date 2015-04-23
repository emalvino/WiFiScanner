'use strict';

angular.module('clientApp').controller('FromCtrl', function ($scope, $routeParams, $location, fromService) {
    $scope.address = {
        mac: $routeParams.mac
    };
    $scope.loading = true;
    fromService.getAddressDetails($scope.address.mac).then(function(response){
    	$scope.address.vendor = response.data.vendor;
        $scope.address.label = response.data.label;
        $scope.loading = false;
    });
    $scope.save = function(){
        fromService.saveAddressDetails($scope.address.mac, { label: $scope.address.label });
        $location.url('/');
    };
});
