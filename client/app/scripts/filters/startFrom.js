'use strict';

angular.module('clientApp').filter('startFrom', function() {
    return function(input, start) {
        start = +start;
        return input.slice(start);
    };
});
