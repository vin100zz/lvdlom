app.directive('lvdlomPalmaresJoueur', function (Formatter) {
  return {
    scope: {
      joueur: '='

    },
    templateUrl: 'app/directives/joueur/palmares.html',
    controller: function ($scope) {
      $scope.Formatter = Formatter;
    }
  };
});