app.directive('lvdlomFicheJoueur', function (Bom, Picture) {
  return {
    scope: {
      joueur: '=',
      cfg: '='
    },
    templateUrl: 'app/directives/joueur/fiche.html',
    controller: function ($scope) {
      $scope.Bom = Bom;
      $scope.Picture = Picture;
    }
  };
});