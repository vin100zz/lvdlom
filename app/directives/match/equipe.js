app.directive('lvdlomEquipeMatch', function (Formatter, Bom) {
  return {
    scope: {
      match: '=',
      cfg: '='
    },
    templateUrl: 'app/directives/match/equipe.html',
    controller: function ($scope) {
      $scope.Formatter = Formatter;

      var CARTONS = {A: 'Avertissement', E: 'Expulsion'};

      // render
      var render = function () {
        if (!$scope.match || !$scope.match.$resolved) {
          return;
        }

        var buteurs = $scope.match.buteurs.om || [];

        var augment = function (joueur) {
          if (joueur.numRmp) {
            var remplacant = $scope.match.joueurs.remplacants[parseInt(joueur.numRmp, 10)-1];
            joueur.minuteOut = remplacant ? remplacant.minuteRmp : '';
          }
          joueur.buts = buteurs.filter(function (but) {
            return but.id === joueur.id && but.note !== 'csc';
          });
          joueur.posteLabel = Bom.poste(joueur.poste);
          joueur.cartonLabel = joueur.carton ? CARTONS[joueur.carton[0]] : '';
          joueur.cartonMinute = joueur.carton && joueur.carton.length > 1 ? joueur.carton.substr(1) + '\'' : '';
          return joueur;
        };

        $scope.titulaires = $scope.match.joueurs.titulaires.map(augment);
        $scope.remplacants = $scope.match.joueurs.remplacants.map(function (joueur) {
          joueur.isRemplacant = true;
          return augment(joueur);
        });
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
