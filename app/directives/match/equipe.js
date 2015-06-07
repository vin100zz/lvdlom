app.directive('lvdlomEquipeMatch', function (Formatter) {
  return {
    scope: {
      match: '=',
      cfg: '='
    },
    templateUrl: 'app/directives/match/equipe.html',
    controller: function ($scope) {
      $scope.Formatter = Formatter;
        
      // render
      var render = function () {
        if (!$scope.match || !$scope.match.$resolved) {
          return;
        }
        
        var augmentWithMinuteOut = function (joueur) {
          if (joueur.numRmp) {
            var remplacant = $scope.match.joueurs.remplacants[parseInt(joueur.numRmp, 10)-1];
            joueur.minuteOut = remplacant.minuteRmp;
          }
          return joueur;
        };
        
        $scope.joueurs = $scope.match.joueurs.titulaires
          .map(function (joueur) {
            return augmentWithMinuteOut(joueur);
          })
          .concat(
            $scope.match.joueurs.remplacants.map(function (joueur) {
              joueur.isRemplacant = true;
              return augmentWithMinuteOut(joueur);
            })
          );
      };
      
      render();
      
      // watch
      $scope.$watch('match', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          render();
        }
      }, true);
    }
  };
});