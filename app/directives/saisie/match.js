app.directive('lvdlomSaisieMatch', function () {
  return {
    scope: {
      cfg: '='
    },
    templateUrl: 'app/directives/saisie/common/abstract.html',
    controller: function ($scope, Match) {

      $scope.match = {};

      $scope.formCfg = getFormCfg();

      function cb (data, dbResult) {
        window.location.hash = '#/match/' + dbResult[0].id;
      };

      function getFormCfg() {
        return {
          id: $scope.cfg.id,
          type: 'match',
          cb: cb,
          inputs: [{
            name: 'match',
            type: 'match'
          }]
        };
      };

    }
  };
});