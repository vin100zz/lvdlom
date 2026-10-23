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
      $scope.photoRatio = 0.85;
      $scope.$watch('cfg.photo', function (photo) {
        $scope.photoOk = false;
        if (!photo) {
          return;
        }
        var img = new Image();
        img.onload = function () {
          if ($scope.cfg && $scope.cfg.photo === photo) {
            // le cadre prend les proportions de la photo : elle est affichée en entier
            $scope.photoRatio = img.naturalHeight ? Math.min(1.6, Math.max(0.5, img.naturalWidth / img.naturalHeight)).toFixed(3) : 0.85;
            $scope.photoOk = true;
            $scope.$applyAsync();
          }
        };
        img.src = photo;
      });
    }
  };
});
