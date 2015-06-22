app.controller('MiniSaisonCtrl', function($scope, Saison, Loading) {
  
  $scope.$watch('selected.id', function (newValue, oldValue) {
    if (newValue !== oldValue) {
      if (newValue) {
        Loading.silent();
        $scope.loading = true;
        $scope.saison = Saison.get({id: newValue}, function (match) {
          $scope.loading = false;
        });
      } else {
        $scope.saison = null;
      }
    }
  }, true);
  
});