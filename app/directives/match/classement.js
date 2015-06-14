app.directive('lvdlomClassementMatch', function () {
  return {
    scope: {
      match: '=',
      cfg: '='
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
            $scope.classement.push({
              om: dotIndex > 0,
              pos: pos || i,
              club: club,
              pts: $scope.match.fiche['classPts' + i]
            });
            if (i === 4 && pos && parseInt(pos, 10) > 4) {
              $scope.classement[$scope.classement.length-2].separator = true;
            }
          }
        }
        
        $scope.commentaire = [$scope.match.fiche.comm1, $scope.match.fiche.comm2, $scope.match.fiche.comm3]
        .filter(function (comm) {
          return !!comm;
        })
        .join(' ');
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