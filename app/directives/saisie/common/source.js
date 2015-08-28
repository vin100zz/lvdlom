app.directive('lvdlomSaisieSource', function () {
  return {
    scope: {
      cfg: '='
    },
    templateUrl: 'app/directives/saisie/common/source.html',
    controller: function ($scope, Dictionary) {

      $scope.sources = Dictionary.sources();

      $scope.cfg.data = null;

      $scope.setValue = function (evt, value) {
        evt.preventDefault();
        $scope.cfg.data = value;
      };

    }
  };
});