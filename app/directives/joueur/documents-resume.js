app.directive('lvdlomDocumentsResumeJoueur', function ($http, $sce) {
  return {
    scope: {
      joueur: '='
    },
    templateUrl: 'app/directives/joueur/documents-resume.html',
    controller: function ($scope) {
      $scope.result    = null;
      $scope.generating = false;
      $scope.error      = null;

      var formatResume = function (data) {
        var html = (data.resume || '')
          .replace(/&(?![a-zA-Z#\d]+;)/g, '&amp;')
          .replace(/<(?!\/?(a|b|i|em|strong|p|br)\b)[^>]*>/gi, '')
          .replace(/\n\n/g, '</p><p>')
          .replace(/\n/g, '<br>');
        data.resumeHtml = $sce.trustAsHtml('<p>' + html + '</p>');
        return data;
      };

      $scope.generate = function () {
        $scope.generating = true;
        $scope.error      = null;
        $scope.result     = null;

        $http.get('services/documents-resume.php', {
          params: { id: $scope.joueur.id, t: Date.now() }
        }).success(function (data) {
          $scope.generating = false;
          if (data.error) {
            $scope.error = data.error;
          } else {
            $scope.result = formatResume(data);
          }
        }).error(function (data) {
          $scope.generating = false;
          $scope.error = (data && data.error) ? data.error : 'Erreur lors de la génération du résumé.';
        });
      };

      // Génération automatique à l'ouverture de la modale
      $scope.generate();
    }
  };
});

