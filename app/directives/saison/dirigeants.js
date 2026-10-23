app.directive('lvdlomDirigeantsSaison', function (Formatter) {
  return {
    scope: {
      saison: '='
    },
    templateUrl: 'app/directives/saison/dirigeants.html',
    controller: function ($scope) {
      $scope.Formatter = Formatter;

      $scope.dates = function (dirigeant) {
        return dirigeant.fin ? Formatter.date(dirigeant.debut) + ' → ' + Formatter.date(dirigeant.fin) : 'depuis le ' + Formatter.date(dirigeant.debut);
      };
    }
  };
});
