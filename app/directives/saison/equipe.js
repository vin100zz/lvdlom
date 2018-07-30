app.directive('lvdlomEquipeSaison', function (Bom, Formatter, Sorter) {
  return {
    scope: {
      saison: '='
    },
    templateUrl: 'app/directives/saison/equipe.html',
    controller: function ($scope) {
      $scope.Bom = Bom;
      $scope.Formatter = Formatter;
      
      $scope.joueurs = $scope.saison.bilan.sort(function (row1, row2) {
        var diff = Sorter.poste(row1.joueur.poste) - Sorter.poste(row2.joueur.poste);
        if (!diff) {
          diff = row1.joueur.nom.localeCompare(row2.joueur.nom);
        }
        return diff;
      });
        
      $scope.entraineurs = $scope.saison.entraineurs.sort(function (entraineur1, entraineur2) {
		if (!entraineur1.fin) {
		  return 1;
		} else if (!entraineur2.fin) {
	      return -1;
		}
        return entraineur1.fin.localeCompare(entraineur2.fin);
      });
    }
  };
});