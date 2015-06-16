app.controller('MiniJoueurCtrl', function($scope, Joueur, Picture, Loading) {
  $scope.Picture = Picture;
  
  $scope.$watch('selected.id', function (newValue, oldValue) {
    if (newValue !== oldValue) {
      if (newValue) {
        Loading.silent();
        $scope.loading = true;
        $scope.joueur = Joueur.get({id: newValue}, function () {$scope.loading = false;});
      } else {
        $scope.joueur = null;
      }
    }
  }, true);
  
});