app.directive('lvdlomFicheDirigeant', function (Bom, Picture) {
  return {
    scope: {
      dirigeant: '=',
      cfg: '='
    },
    templateUrl: 'app/directives/dirigeant/fiche.html',
    controller: function ($scope) {
      $scope.Bom = Bom;
      $scope.Picture = Picture;
    }
  };
});