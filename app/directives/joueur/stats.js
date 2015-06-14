app.directive('lvdlomStatsJoueur', function () {
  return {
    scope: {
      joueur: '=',
      cfg: '='
    },
    templateUrl: 'app/directives/joueur/stats.html',
    controller: function ($scope) {

    }
  };
});