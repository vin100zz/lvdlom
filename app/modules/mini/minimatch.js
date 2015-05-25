app.controller('MiniMatchCtrl', function($scope, Match, Maillots, Loading) {
  
  $scope.$watch('selected.id', function (newValue, oldValue) {
    if (newValue !== oldValue) {
      if (newValue) {
        Loading.silent();
        $scope.loading = true;
        $scope.match = Match.get({id: newValue}, function (match) {
          $scope.maillot = Maillots.get(match.adversaire.nom);
          $scope.loading = false;
        });
      } else {
        $scope.match = null;
      }
    }
  }, true);
  
});