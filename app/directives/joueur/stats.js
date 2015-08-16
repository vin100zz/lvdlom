app.directive('lvdlomStatsJoueur', function (Formatter) {
  return {
    scope: {
      joueur: '='
    },
    templateUrl: 'app/directives/joueur/stats.html',
    controller: function ($scope) {
      $scope.Formatter = Formatter;
    }
  };
});