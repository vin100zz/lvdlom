app.directive('lvdlomFicheDirigeant', function (Bom, Picture, Formatter) {
  return {
    scope: {
      dirigeant: '=',
      cfg: '='
    },
    templateUrl: 'app/directives/dirigeant/fiche.html',
    controller: function ($scope) {
      $scope.Bom = Bom;
      $scope.Picture = Picture;

      $scope.dateNaissance = Formatter.dateLong($scope.dirigeant.fiche.dateNaissance);
      $scope.dateDeces = Formatter.dateLong($scope.dirigeant.fiche.dateDeces);
    }
  };
});