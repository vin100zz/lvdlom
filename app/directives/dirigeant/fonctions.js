app.directive('lvdlomFonctionsDirigeant', function (Bom, Picture) {
  return {
    scope: {
      dirigeant: '=',
      cfg: '='
    },
    templateUrl: 'app/directives/dirigeant/fonctions.html',
    controller: function ($scope) {
      $scope.Bom = Bom;
      $scope.Picture = Picture;
    }
  };
});