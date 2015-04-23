'use strict';

angular.module('clientApp').controller('SessionCtrl', function ($scope, $location, $routeParams, sessionService) {
    $scope.sessions = [];
    $scope.sort = {
        field: 'number',
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
    $scope.save = function(){
        sessionService.saveSession($scope.session).then(function(){
            $location.url('/session');
        });
    };
    if(angular.isDefined($routeParams.number)){
        sessionService.getSession($routeParams.number).then(function(response){
            $scope.session = response.data;
        });
    }
    else{
        sessionService.getSessions().then(function(response){
            $scope.sessions = response.data;
            $scope.pagination.total = response.data.length;
        });
    }
});
