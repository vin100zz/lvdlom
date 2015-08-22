app.directive('lvdlomSaisieForm', function () {
  return {
    scope: {
      cfg: '='
    },
    templateUrl: 'app/directives/saisie/form.html',
    controller: function ($scope, Saisie) {

      $scope.data = {};

      if ($scope.cfg) {
        prepareInput();
      }

      function prepareInput () {
        // init datamodel
        $scope.cfg.inputs.filter(function (input) {
          return !!input.value;
        }).forEach(function (input) {
          var value = input.value;
          if (input.type === 'date') {
            value = new Date(input.value);
          } else if (input.type === 'checkbox') {
            value = !!input.type;
          }
          $scope.data[input.name] = value;
        });

        $scope.data.id = $scope.cfg.id;

        console.log($scope.data);
      }

      $scope.showInputElement = function (type) {
        return ['text', 'date', 'checkbox'].indexOf(type) >= 0;
      };

      $scope.submit = function () {
        Saisie.saveJoueur($scope.data);
      };

      // watch
      $scope.$watch('cfg', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          prepareInput();
        }
      }, true);
      
    }
  };
});