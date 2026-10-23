app.directive('lvdlomStatsJoueur', function (Formatter) {
  return {
    scope: {
      joueur: '='
    },
    templateUrl: 'app/directives/joueur/stats.html',
    controller: function ($scope) {
      $scope.Formatter = Formatter;

      var COMPS = [['ch', 'Champ.'], ['cn', 'Coupe nat.'], ['ce', 'Europe']];

      var n = function (value) {
        return parseInt(value, 10) || 0;
      };
      var tiret = function (value) {
        return value ? String(value) : '–';
      };

      // détail par compétition, au format du site : titularisations, (entrées), buts
      var detail = function (row) {
        return COMPS.map(function (comp) {
          var c = row[comp[0]] || {};
          var m = n(c.tit) + n(c.rmp);
          if (!m) {
            return '';
          }
          var b = n(c.buts);
          return comp[1] + ' ' + (n(c.tit) || '–') + (n(c.rmp) ? ' (' + n(c.rmp) + ')' : '') + (b ? ', ' + b + (b > 1 ? ' buts' : ' but') : '');
        }).filter(Boolean).join(' · ');
      };

      var render = function () {
        var bilan = $scope.joueur && $scope.joueur.bilan;
        if (!bilan) {
          return;
        }
        $scope.saisons = Object.keys(bilan).filter(function (saison) {
          return saison !== 'total';
        }).sort().map(function (saison) {
          var row = bilan[saison];
          return {
            saison: saison,
            total: {m: tiret(n(row.total.tit) + n(row.total.rmp)), b: tiret(n(row.total.buts))},
            comps: COMPS.map(function (comp) {
              var c = row[comp[0]] || {};
              return {tit: tiret(n(c.tit)), rmp: n(c.rmp), b: tiret(n(c.buts))};
            }),
            detail: detail(row)
          };
        });
        var total = bilan.total || {total: {}};
        $scope.totalLigne = {
          total: {m: tiret(n(total.total.tit) + n(total.total.rmp)), b: tiret(n(total.total.buts))},
          comps: COMPS.map(function (comp) {
            var c = total[comp[0]] || {};
            return {m: tiret(n(c.tit) + n(c.rmp)), b: tiret(n(c.buts))};
          }),
          detail: detail(total)
        };
      };

      render();

      $scope.$watch('joueur.bilan', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          render();
        }
      });
    }
  };
});
