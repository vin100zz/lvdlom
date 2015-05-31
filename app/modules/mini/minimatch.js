app.controller('MiniMatchCtrl', function($scope, Match, Bom, Picture, Formatter, Loading) {
  $scope.Bom = Bom;
  $scope.Picture = Picture;
  $scope.Formatter = Formatter;
  
  $scope.$watch('selected.id', function (newValue, oldValue) {
    if (newValue !== oldValue) {
      if (newValue) {
        Loading.silent();
        $scope.loading = true;
        $scope.match = Match.get({id: newValue}, function (match) {
          //$scope.maillot = Maillots.get(match.adversaire.nom);
          $scope.domicile = $scope.Bom.domicile(match.fiche.lieu);
          $scope.left = {
            id: $scope.domicile ? 'OM' : match.adversaire.id,
            nom: $scope.domicile ? 'OM' : match.adversaire.nom,
            buts: $scope.domicile ? match.fiche.butsOM : match.fiche.butsAdv,
            tab: $scope.domicile ? match.fiche.tabOM : match.fiche.tabAdv
          };
          $scope.right = {
            id: !$scope.domicile ? 'OM' : match.adversaire.id,
            nom: !$scope.domicile ? 'OM' : match.adversaire.nom,
            buts: !$scope.domicile ? match.fiche.butsOM : match.fiche.butsAdv,
            tab: !$scope.domicile ? match.fiche.tabOM : match.fiche.tabAdv
          };
          $scope.rqScore = (match.fiche.rqScore === 'tab' ? ($scope.left.tab + '-' + $scope.right.tab + ' ') : '') + match.fiche.rqScore;
          
          var augmentWithMinuteOut = function (joueur) {
            if (joueur.numRmp) {
              var remplacant = match.joueurs.remplacants[parseInt(joueur.numRmp, 10)-1];
              joueur.minuteOut = remplacant.minuteRmp;
            }
            return joueur;
          };
          
          $scope.joueurs = match.joueurs.titulaires
          .map(function (joueur) {
            return augmentWithMinuteOut(joueur);
          }).concat(
            match.joueurs.remplacants.map(function (joueur) {
              joueur.isRemplacant = true;
              return augmentWithMinuteOut(joueur);
            })
          );
          
          $scope.loading = false;
        });
      } else {
        $scope.match = null;
      }
    }
  }, true);
  
});