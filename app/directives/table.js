app.directive('lvdlomTable', function() {
  return {
    scope: {
      cfg: '=',
      lien: '='
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
      
      // petits écrans : lignes en cartes quand la liste en propose (cfg.mobile)
      var media = window.matchMedia ? window.matchMedia('(max-width: 639px)') : null;
      $scope.mobile = !!(media && media.matches);
      $scope.limite = 200;
      var onMedia = function (event) {
        $scope.$applyAsync(function () {
          $scope.mobile = event.matches;
        });
      };
      if (media && media.addListener) {
        media.addListener(onMedia);
        $scope.$on('$destroy', function () {
          media.removeListener(onMedia);
        });
      }

      // colonnes proposées au tri sur mobile
      $scope.triables = $scope.cfg.columns.map(function (column, index) {
        return {index: index, title: column.title};
      }).filter(function (column) {
        return column.title;
      });

      $scope.sortBy = function (index, keepOrder) {
        index = parseInt(index, 10);
        $scope.sortedItems = [];
        if (keepOrder) {
          $scope.sort.column = index;
          $scope.sort.descending = !!$scope.cfg.columns[index].defaultOrderDescending;
          return;
        }
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
          if (typeof column.key !== 'undefined' && item[column.key] === '') {
            return Infinity * ($scope.sort.descending ? -1 : 1);
          }
          return stripAccents(column.sorter.call(this, typeof column.key !== 'undefined' ? item[column.key] : item));
        }
        return stripAccents(item[column.key]);
      };
      
      $scope.sortedItems = [];
      $scope.saveSortedItem = function (itemId, index) {
        $scope.sortedItems[index] = itemId;
        return true;
      };
      
      $scope.getHeaderClass = function (index) {
        if (index === $scope.sort.column) {
          return 'sorting ' + ($scope.sort.descending ? 'desc' : 'asc');
        }
        return 'sorting';
      };

      $scope.getAriaSort = function (index) {
        if (index === $scope.sort.column) {
          return $scope.sort.descending ? 'descending' : 'ascending';
        }
        return 'none';
      };
      
      // selection ; sur mobile, la ligne ouvre directement la fiche
      $scope.selectRow = function (id, rowIndex) {
        if ($scope.mobile && $scope.lien) {
          window.location.hash = $scope.lien.replace(/^#\/?/, '/') + id;
          return;
        }
        if (id === $scope.cfg.selected.id) {
          $scope.cfg.selected.id = null;
          $scope.cfg.selected.rowIndex = null;
        } else {
          $scope.cfg.selected.id = id;
          $scope.cfg.selected.rowIndex = rowIndex;
        }
      };
      
      // watch
      $scope.$watchCollection('cfg.data.list', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          $scope.cfg.selected.id = null;
          $scope.cfg.selected.rowIndex = null;
        }
      });

      $scope.$watch('cfg.selected.rowIndex', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          $scope.cfg.selected.id = $scope.sortedItems[$scope.cfg.selected.rowIndex];
        }
      });
    }
  };
});
