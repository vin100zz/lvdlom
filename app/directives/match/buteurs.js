app.directive('lvdlomButeursMatch', function (Bom) {
  return {
    scope: {
      match: '=',
      cfg: '='
    },
    templateUrl: 'app/directives/match/buteurs.html',
    controller: function ($scope) {
      
      var hasMinute = function (but) {
        return !!but.minute;
      };
      
      var minutesCompletes = function () {
        return $scope.match.buteurs.om.every(hasMinute) && $scope.match.buteurs.omAutres.every(hasMinute) && $scope.match.buteurs.adv.every(hasMinute);
      }
      
      var ordonnerButs = function () {
        if (minutesCompletes()) {
          var domicile = Bom.domicile($scope.match.fiche.lieu);
          var score = {om: 0, adv: 0};
          return $scope.match.buteurs.om.concat($scope.match.buteurs.omAutres).concat($scope.match.buteurs.adv)
            .sort(function (but1, but2) {
              return parseInt(but1.minute, 10) - parseInt(but2.minute, 10);
            })
            .map(function (but, index, array) {
              if (but.adv) {
                ++score.adv;
              } else {
                ++score.om;
              }
              but.score = (domicile ? score.om : score.adv) + '-' + (!domicile ? score.om : score.adv);
              but.right = (domicile && but.adv) || (!domicile && !but.adv);
              but.left = !but.right;
              but.first = index === 0 || array[index-1].adv != but.adv;
              but.last = index === array.length -1 || array[index+1].adv != but.adv;
              return but;
            });
        }
      };
      
      // render
      var render = function () {
        if (!$scope.match.$resolved) {
          return;
        }
        
        var domicile = Bom.domicile($scope.match.fiche.lieu);
        $scope.left = {
          maillot: domicile ? 'OM' : $scope.match.adversaire
        };
        $scope.right = {
          maillot: !domicile ? 'OM' : $scope.match.adversaire
        };
        
        $scope.match.buteurs.adv = $scope.match.buteurs.adv.map(function (but) {
          but.adv = true;
          return but;
        });
        
        $scope.buts = ordonnerButs();
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