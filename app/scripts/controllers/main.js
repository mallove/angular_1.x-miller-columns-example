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

      this.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
  })

//  .factory('MillerColumnsNodeProvider', [
//      '$q',
//      function($q) {
//          function MillerColumnsNodeProvider() {}
//
//          MillerColumnsNodeProvider.prototype.getChildrenNodesPromise = function getChildrenNodesPromise(node) {
//              if (!this.getChildrenNodes) {
//                  throw new Error("[MillerColumnsController] No node provider is defined");
//              }
//
//              var childrenNodes = this.getChildrenNodes(node);
//
//              if (!childrenNodes.then) {
//                  childrenNodes = $q(function(resolver) {
//                      resolver(childrenNodes);
//                  });
//              }
//
//              return childrenNodes;
//          };
//
//          MillerColumnsNodeProvider.prototype.getChildrenNodes = null;
//
//          MillerColumnsNodeProvider.prototype.refresh = function refresh() {};
//
//          return MillerColumnsNodeProvider;
//      }
//  ])

  .controller('MillerColumnsController', [
      '$scope',
      // 'MillerColumnsNodeProvider',  // inject MillerColumnsNodeProvider factory
      function ($scope) {
          var vm = this;

          $scope.$watch('millerColumnsUnravelToNode', function(newNodeIds, oldNodeIds){
              if((newNodeIds != null || newNodeIds != oldNodeIds) && Array.isArray(newNodeIds) && vm.columns[0]){

                  /*  Checks if our miller-columns root is in the array of parents-to-child array (newNodeIds)
                      If it is, count check where in the array  */
                  var isRootNodeInMyNodeIds = false;
                  var offset = 0;
                  angular.forEach(vm.columns[0].nodes, function(rootNode){
                      angular.forEach(newNodeIds, function(myNode, key){
                          if(rootNode.id === myNode){
                              isRootNodeInMyNodeIds = true;
                              offset = key;
                          }
                      });
                  });

                  /*  we cut the array to start at the root of our miller-columns    */
                  if(offset !== 0){
                      newNodeIds.splice(0, offset);
                  }

                  /*  If the root isn't included in our parents-to-child array we add it to the first place assuming
                      that it is the system's root.   */
                  if(!isRootNodeInMyNodeIds && vm.columns[0].nodes.length === 1){
                      newNodeIds.splice(0,0,vm.columns[0].nodes[0].id);
                  }

                  /*  unraveling from the start according to the parent-to-child array resulting of the preparation   */
                  openNodesAccordingToList(newNodeIds, 0);
              }
          });

          vm.addColumn = addColumn;
          vm.columns = [];
          vm.init = init;
          vm.select = select;
          vm.refreshColumns = refreshColumns;
          vm.millerColumnsOnSelect = $scope.millerColumnsOnSelect;

          // vm.init();

          return vm;

          ////////////////////////////////////
          //
          // Poor man's dependency injection
          //
          ////////////////////////////////////
          function MillerColumnsNodeProvider () {
            
            this.getChildrenNodesPromise = function getChildrenNodesPromise(node) {
                if (!this.getChildrenNodes) {
                    throw new Error("[MillerColumnsController] No node provider is defined");
                }

                var childrenNodes = this.getChildrenNodes(node);

                if (!childrenNodes.then) {
                    childrenNodes = $q(function(resolver) {
                        resolver(childrenNodes);
                    });
                }

                return childrenNodes;
            };

            this.getChildrenNodes = null;

            this.refresh = function refresh() {};
          }

          // return MillerColumnsNodeProvider;
          ////////////////////////////////////
          //
          // END: Poor man's dependency injection
          //
          ////////////////////////////////////

          function openNodesAccordingToList(nodeIds, column){
              angular.forEach(vm.columns[column].nodes, function(node){
                  if(node.id === nodeIds[0]){
                      vm.columns[column].selected = nodeIds[0];
                      select(node, column).then(function(){
                          nodeIds.shift();
                          openNodesAccordingToList(nodeIds, column+1);
                      });
                  }
              });
          }

          function addColumn(node, nodes) {
              vm.columns.push({
                  parent: node,
                  nodes: nodes,
                  selected: null,
                  filter: ''
              });
          }

          function init() {
              $scope.millerColumnsNodeProvider = new MillerColumnsNodeProvider();
              $scope.millerColumnsNodeProvider.refresh = refreshColumns;

              $scope.millerColumnsNodeProvider.getChildrenNodesPromise(null).then(function(nodes) {
                  vm.addColumn(null, nodes);
              });
          }

          function select(node, columnId) {
              vm.columns.splice(columnId + 1);

              if (node.type === 'branch') {
                   return $scope.millerColumnsNodeProvider.getChildrenNodesPromise(node).then(function(nodes) {
                      vm.addColumn(node, nodes);
                  });
              } else {
                  return null;
              }
          }

          function refreshColumns() {
              angular.forEach(vm.columns, function(column, columnId) {
                  $scope.millerColumnsNodeProvider.getChildrenNodesPromise(column.parent).then(function(nodes) {
                      if (nodes.length > 0) {
                          vm.columns[columnId] = {
                              parent: column.parent,
                              nodes: nodes,
                              selected: column.selected,
                              filter: column.filter
                          };
                      } else {
                          vm.columns.splice(columnId);
                      }
                  });
              });
          }
      }
  ])

  .controller('MillerColumnController', [
      '$scope', '$location', '$anchorScroll', 'MillerColumnsConfiguration', '$timeout',
      function ($scope, $location, $anchorScroll, MillerColumnsConfiguration, $timeout) {
          var vm = this;

          $scope.$watch('vm.data.selected', function(){
              angular.forEach(vm.data.nodes, function(node) {
                  if (isNodeActive(node)) {
                      $timeout(function(nodeId){
                          $location.hash("#"+nodeId);
                          $anchorScroll();
                      }, 500, true, node.id);
                  }
              });
          });

          vm.data = $scope.millerColumnData;
          vm.init = init;
          vm.isNodeActive = isNodeActive;
          vm.selectNode = selectNode;
          vm.configuration = MillerColumnsConfiguration;

          // vm.init();

          return vm;

          function init() {
              $location.hash('miller-columns-end');
              $anchorScroll();
          }

          function isNodeActive(node) {
              return vm.data.selected && node.id === vm.data.selected;
          }

          function selectNode(node) {
              vm.data.selected = node.id;

              $scope.millerColumnsCtrl.select(node, $scope.millerColumnId);
              $scope.millerColumnsCtrl.millerColumnsOnSelect({node: node});
          }
      }
  ])

  .directive('millerColumns', [
      function() {
          return {
              restrict: "EA",
              replace: true,
              scope: {
                  millerColumnsNodeProvider: '=',
                  millerColumnsUnravelToNode: '=',
                  millerColumnsOnSelect: '&'
              },
              controller: 'MillerColumnsController as millerColumns',
              template: '<div class="miller-columns"> ' +
    '<ul data-ng-repeat="column in millerColumns.columns" ' +
        'data-miller-column ' +
        'data-miller-column-id="$index" ' +
        'data-miller-column-data="column"> ' +
    '</ul> ' +
    '<div id="miller-columns-end"></div> ' +
      '</div>'
          };
      }
  ])

  .directive('millerColumn', [
      function() {
          return {
              restrict: "EA",
              require: "^millerColumns",
              replace: true,
              scope: {
                  millerColumnId: '=',
                  millerColumnData: '='
              },
              link: function(scope, element, attr, millerColumnsCtrl) {
                  scope.millerColumnsCtrl = millerColumnsCtrl;
              },
              controller: 'MillerColumnController as millerColumn',
              template: '<ul class="miller-columns-column"> ' +
    '<li class="miller-columns-filter" ng-if="millerColumn.configuration.filter"> ' +
        '<input type="text" placeholder="{{millerColumn.configuration.filterPlaceholder}}" data-ng-model="millerColumn.data.filter"> ' +
    '</li> ' +
    '<li class="miller-columns-node" alt="{{node.node}}" title="{{node.node}}" ' +
        'data-ng-class="{\'active\': millerColumn.isNodeActive(node)}" ' +
        'data-ng-repeat="node in millerColumn.data.nodes | filter: millerColumn.data.filter"> ' +
        '<a ' +
           'data-ng-click="millerColumn.selectNode(node)"> ' +
      '{{node.node}} ' +
      '<span class="glyphicon miller-columns-item-icon" ' +
            'data-ng-class="{\'glyphicon-chevron-right\': node.type === \'branch\'}"></span> ' +
        '</a> ' +
    '</li> ' +
      '</ul>'
          };
      }
  ])

  .value('MillerColumnsConfiguration', {
      filter: true,
      filterPlaceholder: 'Filter...'
  })

;
