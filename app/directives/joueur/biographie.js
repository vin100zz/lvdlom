app.directive('lvdlomBiographieJoueur', function ($http, $sce) {
  return {
    scope: {
      joueur: '='
    },
    templateUrl: 'app/directives/joueur/biographie.html',
    controller: function ($scope) {
      $scope.biography  = null;
      $scope.generating = false;
      $scope.error      = null;

      var formatBiographie = function (data) {
        var html = (data.biographie || '')
          .replace(/&(?![a-zA-Z#\d]+;)/g, '&amp;')
          .replace(/<(?!\/?(a|b|i|em|strong|p|br)\b)[^>]*>/gi, '') // autoriser uniquement <a>, <b>, <i>, <em>, <strong>, <p>, <br>
          .replace(/\n\n/g, '</p><p>')
          .replace(/\n/g, '<br>');
        data.biographieHtml = $sce.trustAsHtml('<p>' + html + '</p>');
        return data;
      };

      $scope.generate = function () {
        $scope.generating = true;
        $scope.error      = null;
        $scope.biography  = null;

        $http.get('services/biography.php', {
          params: { id: $scope.joueur.id, t: Date.now() }
        }).success(function (data) {
          $scope.generating = false;
          if (data.error) {
            $scope.error = data.error;
          } else {
            $scope.biography = formatBiographie(data);
          }
        }).error(function (data) {
          $scope.generating = false;
          $scope.error = (data && data.error) ? data.error : 'Erreur lors de la génération de la biographie.';
        });
      };

      // Génération automatique à l'ouverture de la modale
      $scope.generate();
    }
  };
});
