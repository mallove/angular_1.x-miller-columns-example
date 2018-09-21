'use strict';

/**
 * @ngdoc function
 * @name angular1xMillerColumnsExampleApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the angular1xMillerColumnsExampleApp
 */

angular.module('angular1xMillerColumnsExampleApp')
  .controller('MainCtrl', function () {

  var nodes = [
      {
          id: 'id1',
          node: 'node1',
          type: 'leaf',
          info: {
              whatever: ['you', 'need']
          }
      },
      {
          id: 'id2',
          node: 'node2',
          type: 'branch'
      }
  ];
   
  // The node provider must be an instance of MillerColumnsNodeProvider factory
  this.nodeProvider = new MillerColumnsNodeProvider();
   
  // Its getChildrenNodes must return "node" children.
  // If node === null, you should return root level nodes. The way you retrieve/store your nodes is up to you
  // You may directly return data or return a promise.
  this.nodeProvider.getChildrenNodes = function(node) {
      return $q(function(resolve) {
          resolve(children);
      });
      // OR 
      // return data;
  };
   
  this.onSelectCallback = function(node) {
      // Whatever you need...
  };
   
  // You may also inject the MillerColumnsConfiguration value provider in your controller and set some options
  // Activate column filter (activated by default)
  MillerColumnsConfiguration.filter = true;
  // Set filter field placeholder
  MillerColumnsConfiguration.filterPlaceholder = 'Filter!';

    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
