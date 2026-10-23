/* exported AbstractListCtrl */
var AbstractListCtrl = function ($scope, $injector, Loading, Filter, pageTitle) {

  $injector.invoke(AbstractModuleCtrl, this, {$scope: $scope, pageTitle: pageTitle});
  
  // filters
  $scope.filters = [];
  
  // data
  $scope.data = {list: []};
  $scope.fetchData = function (filters) {};
  
  // filters change
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
  
  $scope.$watchCollection('data.list', function (newValue, oldValue) {
    if (newValue !== oldValue) {
      $scope.maxData.value = computeMax(newValue);
    }
  });

  // selection
  $scope.selected = {id: null, rowIndex: null};
  $scope.selectionTpl = '';
  $scope.selectionLink = null;
  
  // keyboard shortcut — $apply uniquement quand la sélection change réellement
  window.onkeydown = function (evt) {
    if (evt.target.tagName.toLowerCase() !== 'input' ) {
      if (evt.which === 40 && $scope.selected.rowIndex < $scope.data.list.length - 1) {
        evt.preventDefault();
        ++$scope.selected.rowIndex;
        $scope.$apply();
      } else if (evt.which === 38 && $scope.selected.rowIndex > 0) {
        evt.preventDefault();
        --$scope.selected.rowIndex;
        $scope.$apply();
      }
    }
  };
  
  // chart
  $scope.chartCfg = null;

  // bilan compact (mobile) : les parts du graphique, de la plus favorable à la moins favorable
  var compact = {key: null, value: null};
  $scope.bilanCompact = function () {
    var cfg = $scope.chartCfg;
    if (!cfg || !cfg.main) {
      return {parts: []};
    }
    var values = cfg.main.data.value || [];
    var inner = (cfg.inner && cfg.inner.data.value) || [];
    var key = values.join(',') + '|' + inner.join(',');
    if (key !== compact.key) {
      var parts = values.map(function (n, i) {
        return {n: parseInt(n, 10) || 0, color: cfg.main.settings[i].color, label: cfg.main.settings[i].label};
      }).reverse();
      compact.key = key;
      compact.value = {
        parts: parts,
        aria: parts.map(function (part) { return part.n + ' ' + part.label; }).join(', '),
        buts: inner.length === 2 ? (parseInt(inner[1], 10) || 0) + ' – ' + (parseInt(inner[0], 10) || 0) + ' buts' : ''
      };
    }
    return compact.value;
  };
};