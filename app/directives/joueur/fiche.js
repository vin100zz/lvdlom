app.directive('lvdlomFicheJoueur', function (Bom, Picture, Formatter) {
  return {
    scope: {
      joueur: '=',
      cfg: '='
    },
    templateUrl: 'app/directives/joueur/fiche.html',
    controller: function ($scope) {
      $scope.Bom = Bom;
      $scope.Picture = Picture;

      $scope.dateNaissance = Formatter.dateLong($scope.joueur.fiche.dateNaissance);
      $scope.dateDeces = Formatter.dateLong($scope.joueur.fiche.dateDeces);
    }
  };
});