/* exported AbstractListCtrl */
var AbstractListCtrl = function ($scope, Loading, Filter) {
  
  // filters
  $scope.filters = [];
  
  // data
  $scope.data = {list: []};
  $scope.fetchData = function (filters) {};
  
  // data change
  $scope.$watch('filters', function (newValue, oldValue) {
    if (newValue !== oldValue) {
      Loading.silent();
      var filtersUpdated = Filter.updated(newValue, oldValue);
      if (filtersUpdated) {
        $scope.data.list = $scope.fetchData.call(this, filtersUpdated);
      }
    }
  }, true);
  
  // max data
  $scope.maxCriterionFn = function (item) {return item.nbMatches;};
  
  var computeMax = function (list) {
    return list.reduce(function (result, current) {
      return Math.max(result, $scope.maxCriterionFn(current));
    }, 0);
  };
  $scope.maxData = {value: computeMax($scope.data.list)};
  
  $scope.$watch('data.list', function (newValue, oldValue) {
    if (newValue !== oldValue) {
      $scope.maxData.value = computeMax(newValue);
    }
  }, true);
  
  // selection
  $scope.selected = {id: null, rowIndex: null};
  $scope.selectionTpl = '';
  $scope.selectionLink = null;
  
  // keyboard shortcut
  window.onkeydown = function (evt) {
    if (evt.target.tagName.toLowerCase() !== 'input' ) {
      evt.preventDefault();
      if (evt.which === 40 && $scope.selected.rowIndex < $scope.data.list.length - 1) {
        ++$scope.selected.rowIndex;
      } else if (evt.which === 38 && $scope.selected.rowIndex > 0) {
        --$scope.selected.rowIndex;
      }
      $scope.$apply();
    }
  };
  
  // chart
  $scope.chartCfg = null;
};