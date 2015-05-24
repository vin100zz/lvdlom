app.directive('lvdlomTable', function() {
  return {
    scope: {
      cfg: '='
    },
    templateUrl: 'app/directives/table.html',
    controller: function($scope, $element) {
      $scope.getNbColumns = function () {
        return $scope.cfg.columns.length + ($scope.cfg.showRanking ? 1 : 0);
      };
      
      // loading
      $scope.isLoading = function () {
        return !$scope.cfg.data.list.$resolved;
      };
      
      $scope.hasResults = function () {
        return $scope.cfg.data.list.length > 0;
      };
      
      // sorting
      var stripAccents = function (str) {
        if (typeof str === 'string') {
          var accent = [
              /[\300-\306]/g, /[\340-\346]/g, // A, a
              /[\310-\313]/g, /[\350-\353]/g, // E, e
              /[\314-\317]/g, /[\354-\357]/g, // I, i
              /[\322-\330]/g, /[\362-\370]/g, // O, o
              /[\331-\334]/g, /[\371-\374]/g, // U, u
              /[\321]/g, /[\361]/g, // N, n
              /[\307]/g, /[\347]/g, // C, c
          ];
          var noaccent = ['A','a','E','e','I','i','O','o','U','u','N','n','C','c'];
           
          for (var i = 0; i < accent.length; i++){
            str = str.replace(accent[i], noaccent[i]);
          }
       } 
        return str;
      };
      
      $scope.sort = {
        column: $scope.cfg.defaultSort || 0,
        descending: !!$scope.cfg.columns[$scope.cfg.defaultSort || 0].defaultOrderDescending
      };
      
      $scope.sortBy = function (index) {
        if ($scope.sort.column === index) {
          $scope.sort.descending = !$scope.sort.descending;
        } else {
          var column = $scope.cfg.columns[index];
          $scope.sort.column = index;
          $scope.sort.descending = !!column.defaultOrderDescending;
        }
      };
      
      $scope.sortFn = function (item) {
        var column = $scope.cfg.columns[$scope.sort.column];
        if (column.sorter) {
          return stripAccents(column.sorter.call(this, typeof column.key !== 'undefined' ? item[column.key] : item));
        }
        return stripAccents(item[column.key]);
      };
      
      $scope.getHeaderClass = function (index) {
        if (index === $scope.sort.column) {
          return 'sorting ' + ($scope.sort.descending ? 'desc' : 'asc');
        }
        return 'sorting';
      };
      
      // selection      
      $scope.selectRow = function (id) {
        if (id === $scope.cfg.selected.id) {
          $scope.cfg.selected.id = null;
        } else {
          $scope.cfg.selected.id = id;
        }
      };
      
      $scope.$watch('cfg.data.list', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          $scope.cfg.selected.id = null;
        }
      }, true);
    }
  };
});
