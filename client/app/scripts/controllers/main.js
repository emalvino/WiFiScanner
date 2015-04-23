'use strict';

angular.module('clientApp').controller('MainCtrl', function ($scope, fromService) {
    $scope.fromAddresses = [];
    $scope.sort = {
        field: 'ssidCount',
        direction: true,
        by: function(newField){
            if(this.field === newField){
                this.direction = !this.direction;
            }
            else{
                this.field = newField;
                this.direction = true;
            }
        }
    };
    $scope.pagination = {
        total: 0,
        pageSize: 10,
        currentPage: 1,
        first: 0,
        changed: function(){
            this.first = (this.currentPage - 1) * this.pageSize;
        }
    };
    fromService.getFromAddresses().then(function(results){
    	$scope.fromAddresses = results.data;
        $scope.pagination.total = results.data.length;
    });
  });
