app.directive('lvdlomButeursMatch', function (Bom, Formatter) {
  return {
    scope: {
      match: '='
    },
    templateUrl: 'app/directives/match/buteurs.html',
    controller: function ($scope) {
      $scope.Formatter = Formatter;

      var NOTES = {pen: 'pén.', csc: 'c.s.c.'};

      var minute = function (but) {
        return parseInt(but.minute, 10) + (but.minuteExtra ? parseInt(but.minuteExtra, 10) : 0);
      };

      var hasMinute = function (but) {
        return !!but.minute;
      };

      var areMinutesCompletes = function () {
        return $scope.match.buteurs.om.every(hasMinute) && $scope.match.buteurs.omAutres.every(hasMinute) && $scope.match.buteurs.adv.every(hasMinute);
      };

      var ordonnerButs = function () {
        var minutesCompletes = areMinutesCompletes();
        var domicile = Bom.domicile($scope.match.fiche.lieu);
        var score = {om: 0, adv: 0};
        return $scope.match.buteurs.om.concat($scope.match.buteurs.omAutres).concat($scope.match.buteurs.adv)
          .sort(function (but1, but2) {
            return minute(but1) - minute(but2);
          })
          .map(function (but) {
            if (but.adv) {
              ++score.adv;
            } else {
              ++score.om;
            }
            but.score = minutesCompletes ? ((domicile ? score.om : score.adv) + '-' + (!domicile ? score.om : score.adv)) : null;
            but.right = (domicile && but.adv) || (!domicile && !but.adv);
            but.left = !but.right;
            but.link = !but.adv && but.note !== 'csc' && but.id;
            but.minuteTexte = but.minute ? but.minute + (but.minuteExtra ? '+' + but.minuteExtra : '') + '\'' : '';
            but.noteTexte = NOTES[but.note] || but.note || '';
            but.nomHtml = but.link ? '<a href="#/joueur/' + but.id + '">' + but.nom + '</a>' : but.nom;
            return but;
          });
      };

      // render
      var render = function () {
        if (!$scope.match || !$scope.match.$resolved) {
          return;
        }

        var domicile = Bom.domicile($scope.match.fiche.lieu);

        $scope.match.buteurs.adv = $scope.match.buteurs.adv.map(function (but) {
          but.adv = true;
          return but;
        });

        $scope.buts = ordonnerButs();

        var fiche = $scope.match.fiche;
        $scope.rq = fiche.rqScore === 'tab' ? 'Tirs au but' : (fiche.rqScore === 'ap' ? 'Après prolongation' : '');
        $scope.tab = fiche.rqScore === 'tab' ?
          (domicile ? fiche.tabOM + '-' + fiche.tabAdv : fiche.tabAdv + '-' + fiche.tabOM) : '';
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
