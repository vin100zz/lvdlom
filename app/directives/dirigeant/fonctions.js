app.directive('lvdlomFonctionsDirigeant', function (Formatter) {
  return {
    scope: {
      dirigeant: '=',
      cfg: '='
    },
    templateUrl: 'app/directives/dirigeant/fonctions.html',
    controller: function ($scope) {
      $scope.dates = function (fonction) {
        var debut = Formatter.dateLongue(fonction.debut);
        return fonction.fin ? 'du ' + debut + ' au ' + Formatter.dateLongue(fonction.fin) : 'depuis le ' + debut;
      };
    }
  };
});
