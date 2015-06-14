app.directive('lvdlomPalmaresJoueur', function () {
  return {
    scope: {
      joueur: '=',
      cfg: '='
    },
    templateUrl: 'app/directives/joueur/palmares.html',
    controller: function ($scope) {
      
      // render
      var render = function () {

      };
      
      render();
      
      // watch
      $scope.$watch('joueur', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          render();
        }
      }, true);
    }
  };
});