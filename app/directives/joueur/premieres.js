app.directive('lvdlomPremieresJoueur', function (Formatter) {
  return {
    scope: {
      joueur: '='
    },
    templateUrl: 'app/directives/joueur/premieres.html',
    controller: function ($scope) {
      $scope.Formatter = Formatter;

      $scope.formatAge = function (days) {
        return Math.floor(days/365);
      };

      var render = function () {
        var joueur = $scope.joueur;
        if (!joueur || !joueur.id) {
          return;
        }
        var premieres = [];
        var affiche = function (match) {
          return Formatter.match(match) + ' ' + Formatter.score(Formatter.$Score.big, match);
        };
        if (joueur.premierMatch && joueur.premierMatch.id) {
          premieres.push({
            label: 'Premier match',
            date: Formatter.date(joueur.premierMatch.date),
            match: joueur.premierMatch,
            affiche: affiche(joueur.premierMatch),
            note: 'à l\'âge de ' + $scope.formatAge(joueur.premierMatch.age) + ' ans'
          });
        }
        if (joueur.premierBut && joueur.premierBut.id) {
          var rang = parseInt(joueur.premierBut.card, 10);
          premieres.push({
            label: 'Premier but',
            date: Formatter.date(joueur.premierBut.date),
            match: joueur.premierBut,
            affiche: affiche(joueur.premierBut),
            note: 'pour son ' + rang + (rang === 1 ? 'er' : 'e') + ' match'
          });
        }
        $scope.premieres = premieres;
      };

      render();

      $scope.$watch('joueur.id', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          render();
        }
      });
    }
  };
});
