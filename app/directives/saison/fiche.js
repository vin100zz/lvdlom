app.directive('lvdlomFicheSaison', function () {
  return {
    scope: {
      saison: '='
    },
    templateUrl: 'app/directives/saison/fiche.html',
    controller: function ($scope, Picture, Formatter) {
      $scope.Picture = Picture;
      $scope.Formatter = Formatter;

      // la photo d'équipe n'existe pas pour toutes les saisons
      $scope.photoOk = false;
      $scope.$watch('saison.id', function (id) {
        $scope.photoOk = false;
        if (!id) {
          return;
        }
        var img = new Image();
        img.onload = function () {
          $scope.photoOk = true;
          $scope.$applyAsync();
        };
        img.src = Picture.saison(id);
      });
    }
  };
});
