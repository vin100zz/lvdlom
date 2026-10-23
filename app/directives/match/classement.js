app.directive('lvdlomClassementMatch', function () {
  return {
    scope: {
      match: '='
    },
    templateUrl: 'app/directives/match/classement.html',
    controller: function ($scope) {
      
      // render
      var render = function () {
        if (!$scope.match || !$scope.match.$resolved) {
          return;
        }
        
        $scope.classement = [];
        for (var i=1; i<=4; ++i) {
          var club = $scope.match.fiche['class' + i];
          if (club) {
            var pos = null;
            var dotIndex = club.indexOf('.');
            if (dotIndex > 0) {
              pos = club.substr(0, dotIndex);
              club = club.substr(dotIndex+2);
            }
            // « OM (51/33) » : buts pour et contre de l'OM, affichés à part
            var buts = /^(.*?)\s*\((\d+)\s*\/\s*(\d+)\)$/.exec(club);
            if (buts) {
              club = buts[1];
            }
            $scope.classement.push({
              om: dotIndex > 0 || /^(OM|MARSEILLE)/.test(club),
              pos: pos || i,
              club: club,
              buts: buts ? buts[2] + ' / ' + buts[3] : '',
              pts: $scope.match.fiche['classPts' + i]
            });
            if (i === 4 && pos && parseInt(pos, 10) > 4 && $scope.classement.length >= 2) {
              $scope.classement[$scope.classement.length-2].separator = true;
            }
          }
        }
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