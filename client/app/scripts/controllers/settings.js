'use strict';

angular.module('clientApp').controller('SettingsCtrl', function ($scope, $rootScope, $localStorage, $location, scanService) {
    $scope.settings = {
    	serverUrl: $localStorage.serverUrl
    };
    $scope.test = function(){
    	$scope.testResult = 'waiting';
    	scanService.getScanStatus($scope.settings.serverUrl).success(function(){
    		$scope.testResult = 'ok';
    	}).error(function(data){
    		$scope.error = 'Error: ' + data;
    		$scope.testResult = 'error';
    	});
    };
    $scope.startScanning = function(type){
        var target;
        if(type === 'signal'){
            target = $scope.target;
        }
    	scanService.startScan(type, target).then(function(results){
    		$rootScope.scanStatus = results.data.status;
    	});
    };
    $scope.stopScanning = function(){
    	scanService.stopScan().then(function(results){
    		$rootScope.scanStatus = results.data.status;
    	});
    };
    $scope.save = function(){
    	$localStorage.serverUrl = $scope.settings.serverUrl;
    	$location.url('/');
    };
});
