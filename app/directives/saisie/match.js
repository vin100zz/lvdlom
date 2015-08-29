app.directive('lvdlomSaisieMatch', function () {
  return {
    scope: {
      cfg: '='
    },
    templateUrl: 'app/directives/saisie/common/abstract.html',
    controller: function ($scope, Match) {

      $scope.match = {};

      $scope.formCfg = getFormCfg();

      function getFormCfg() {
        return {
          id: $scope.cfg.id,
          inputs: [{
            name: 'match',
            type: 'match'
          }]
        };
      };

    }
  };
});