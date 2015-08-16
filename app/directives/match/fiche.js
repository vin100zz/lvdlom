app.directive('lvdlomFicheMatch', function (Bom, Picture, Formatter) {
  return {
    scope: {
      match: '=',
      cfg: '='
    },
    templateUrl: 'app/directives/match/fiche.html',
    controller: function ($scope) {
      $scope.Picture = Picture;
      $scope.Formatter = Formatter;
      
      // render
      var render = function () {
        if (!$scope.match || !$scope.match.$resolved) {
          return;
        }
        
        var domicile = Bom.domicile($scope.match.fiche.lieu);
        $scope.left = {
          id: domicile ? 'OM' : $scope.match.adversaire.id,
          nom: domicile ? 'OM' : $scope.match.adversaire.nom,
          buts: domicile ? $scope.match.fiche.butsOM : $scope.match.fiche.butsAdv,
          tab: domicile ? $scope.match.fiche.tabOM : $scope.match.fiche.tabAdv
        };
        $scope.right = {
          id: !domicile ? 'OM' : $scope.match.adversaire.id,
          nom: !domicile ? 'OM' : $scope.match.adversaire.nom,
          buts: !domicile ? $scope.match.fiche.butsOM : $scope.match.fiche.butsAdv,
          tab: !domicile ? $scope.match.fiche.tabOM : $scope.match.fiche.tabAdv
        };
        $scope.rqScore = ($scope.match.fiche.rqScore === 'tab' ? ($scope.left.tab + '-' + $scope.right.tab + ' ') : '') + $scope.match.fiche.rqScore;
      };
      
      render();
      
      // watch
      $scope.$watch('match', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          render();
        }
      }, true);
    }
  };
});