app.directive('lvdlomFilters', function () {
  return {
    scope: {
      cfg: '='
    },
    templateUrl: 'app/directives/filters.html',
    controller: function ($scope) {
      $scope.toggleActivation = function (filter) {
        filter.active = !filter.active;
      };
      
      $scope.activate = function (filter) {
        filter.active = true;
      }
    }
  };
});