app.directive('lvdlomPalmaresJoueur', function () {
  return {
    scope: {
      joueur: '=',
      cfg: '='
    },
    templateUrl: 'app/directives/joueur/palmares.html',
    controller: function ($scope) {

    }
  };
});