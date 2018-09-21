'use strict';

/**
 * @ngdoc overview
 * @name angular1xMillerColumnsExampleApp
 * @description
 * # angular1xMillerColumnsExampleApp
 *
 * Main module of the application.
 */
angular
  .module('angular1xMillerColumnsExampleApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
