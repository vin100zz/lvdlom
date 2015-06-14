app.directive('lvdlomFicheJoueur', function () {
  return {
    scope: {
      joueur: '=',
      cfg: '='
    },
    templateUrl: 'app/directives/joueur/fiche.html',
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