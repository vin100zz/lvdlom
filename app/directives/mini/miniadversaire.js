app.controller('MiniAdversaireCtrl', function($scope, Adversaire, Picture, Loading, ClubColors) {
  $scope.Picture = Picture;

  $scope.$watch('selected.id', function (newValue, oldValue) {
    if (newValue !== oldValue) {
      if (newValue) {
        Loading.silent();
        $scope.loading = true;
        $scope.couleurs = ClubColors.initial(newValue);
        ClubColors.get(newValue).then(function (couleurs) {
          $scope.couleurs = couleurs;
        });
        $scope.adversaire = Adversaire.get({id: newValue}, function (adversaire) {
          $scope.cfgMaillot = {
            idClub: adversaire.id,
            nomClub: adversaire.nom
          };
          $scope.loading = false;
        });
      } else {
        $scope.adversaire = null;
      }
    }
  }, true);

});
