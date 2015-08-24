app.directive('lvdlomSaisieForm', function () {
  return {
    scope: {
      cfg: '='
    },
    templateUrl: 'app/directives/saisie/common/form.html',
    controller: function ($scope, $rootScope, Saisie) {

      $scope.data = {};

      if ($scope.cfg) {
        prepareInput();
      }

      function prepareInput () {
        // init datamodel
        $scope.cfg.inputs.filter(function (input) {
          return !!input.value;
        }).forEach(function (input) {
          // default
          var value = input.value;

          // date
          if (input.type === 'date') {
            value = new Date(input.value);
          }

          // checkbox
          else if (input.type === 'checkbox') {
            value = !!input.type;
          }

          // documents
          else if (input.type === 'documents') {
            value = [];            
          }

          $scope.data[input.name] = value;
        });

        $scope.data.id = $scope.cfg.id;
        $scope.data.type = $scope.cfg.type;
      }

      $scope.showInputElement = function (type) {
        return ['text', 'date', 'checkbox'].indexOf(type) >= 0;
      };

      $scope.submit = function () {
        Saisie.save($scope.data, function (dbResult) {
          $scope.cfg.cb($scope.data, dbResult);

          if (dbResult.res === 'ok') {
            $rootScope.$broadcast('alert.new', 'success', 'Base de données mise à jour !');
          }
        });
      };

      $scope.reset = function (evt) {
        evt.preventDefault();
        $scope.data = {
          id: $scope.cfg.id,
          type: $scope.cfg.type
        };
      }

      // watch
      $scope.$watch('cfg', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          prepareInput();
        }
      }, true);

      // documents
      $scope.documentsCfg = {data: ''};

      $scope.$watch('documentsCfg', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          $scope.data.documents = newValue.data;
        }
      }, true);
    }
  };
});