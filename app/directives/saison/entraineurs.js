app.directive('lvdlomEntraineursSaison', function (Formatter) {
  return {
    scope: {
      saison: '='
    },
    templateUrl: 'app/directives/saison/entraineurs.html',
    controller: function ($scope) {

      // ordre chronologique de départ ; on affiche le dernier en premier
      var chronologique = ($scope.saison.entraineurs || []).slice().sort(function (entraineur1, entraineur2) {
        if (!entraineur1.fin) {
          return 1;
        } else if (!entraineur2.fin) {
          return -1;
        }
        return Formatter.isoDate(entraineur1.fin).localeCompare(Formatter.isoDate(entraineur2.fin));
      });

      $scope.entraineurs = chronologique.map(function (entraineur, index) {
        var dernier = index === chronologique.length - 1;
        entraineur.jusque = !dernier && entraineur.fin ? 'Jusqu\'au ' + Formatter.dateLongue(entraineur.fin) : (!entraineur.fin ? 'En poste' : '');
        return entraineur;
      }).reverse();
    }
  };
});
