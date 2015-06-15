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
    }
  };
});