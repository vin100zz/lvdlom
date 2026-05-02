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
        var idOm = 'OM';
        var nomOm = Formatter.nomOm($scope.match.fiche.saison);
        var idAdv = $scope.match.adversaire.id;
        var nomAdv = $scope.match.adversaire.nom;

        $scope.left = {
          id: domicile ? idOm : idAdv,
          nom: domicile ? nomOm : nomAdv,
          buts: domicile ? $scope.match.fiche.butsOM : $scope.match.fiche.butsAdv,
          tab: domicile ? $scope.match.fiche.tabOM : $scope.match.fiche.tabAdv,
          maillot: { idClub: domicile ? idOm : idAdv, nomClub: domicile ? nomOm : nomAdv }
        };
        $scope.right = {
          id: !domicile ? idOm : idAdv,
          nom: !domicile ? nomOm : nomAdv,
          buts: !domicile ? $scope.match.fiche.butsOM : $scope.match.fiche.butsAdv,
          tab: !domicile ? $scope.match.fiche.tabOM : $scope.match.fiche.tabAdv,
          maillot: { idClub: !domicile ? idOm : idAdv, nomClub: !domicile ? nomOm : nomAdv }
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
