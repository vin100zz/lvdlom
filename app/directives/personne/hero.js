// Hero d'une fiche joueur ou dirigeant : photo, nom, champs étiquetés et chiffres clés
app.directive('lvdlomHeroPersonne', function () {
  return {
    scope: {
      cfg: '='
    },
    templateUrl: 'app/directives/personne/hero.html',
    controller: function ($scope) {
      // la photo n'existe pas toujours : on affiche alors les initiales
      $scope.photoOk = false;
      $scope.$watch('cfg.photo', function (photo) {
        $scope.photoOk = false;
        if (!photo) {
          return;
        }
        var img = new Image();
        img.onload = function () {
          if ($scope.cfg && $scope.cfg.photo === photo) {
            $scope.photoOk = true;
            $scope.$applyAsync();
          }
        };
        img.src = photo;
      });
    }
  };
});
