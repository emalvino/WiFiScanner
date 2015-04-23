'use strict';

angular.module('clientApp', ['ngAnimate', 'ngCookies', 'ngResource', 'ngRoute', 'ngSanitize', 'ngStorage', 'ngTouch', 'ui.bootstrap'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', { templateUrl: 'views/main.html', controller: 'MainCtrl' })
      .when('/session', { templateUrl: 'views/session.html', controller: 'SessionCtrl' })
      .when('/session/:number', { templateUrl: 'views/sessionDetails.html', controller: 'SessionCtrl' })
      .when('/from/:mac', { templateUrl: 'views/from.html', controller: 'FromCtrl' })
      .when('/entries/:mac', { templateUrl: 'views/entries.html', controller: 'EntriesCtrl' })
      .when('/ssid', { templateUrl: 'views/ssid.html', controller: 'SsidCtrl' })
      .when('/ssid/:ssid', { templateUrl: 'views/ssidAddresses.html', controller: 'SsidCtrl' })
      .when('/settings', { templateUrl: 'views/settings.html', controller: 'SettingsCtrl' })
      .otherwise({ redirectTo: '/' });
  })
  .run(function($rootScope, $localStorage, scanService){
    if(!$localStorage.serverUrl){
      $localStorage.serverUrl = 'http://localhost:3000';
    }
    scanService.getScanStatus().success(function(result){
      $rootScope.scanStatus = result.status;
    });
  });
