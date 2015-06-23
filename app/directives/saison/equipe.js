app.directive('lvdlomEquipeSaison', function (Bom) {
  return {
    scope: {
      saison: '='
    },
    templateUrl: 'app/directives/saison/equipe.html',
    controller: function ($scope) {
      $scope.Bom = Bom;
      
      $scope.joueurs = $scope.saison.bilan.sort(function (row1, row2) {
          return parseInt(row2.total.tit, 10) + parseInt(row2.total.rmp, 10) - (parseInt(row1.total.tit, 10) + parseInt(row1.total.rmp, 10));
      });
        
      $scope.entraineurs = $scope.saison.entraineurs.sort(function (entraineur1, entraineur2) {
        return entraineur1.fin.localeCompare(entraineur2.fin);
      });
    }
  };
});