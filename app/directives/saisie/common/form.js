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
          return !!input.value || input.localStorage;
        }).forEach(function (input) {
          // default
          var value = input.value || (input.localStorage ? getFromLocalStorage(input.name) : null);

          // date
          if (input.type === 'date') {
            value = new Date(input.value);
          }

          // checkbox
          else if (input.type === 'checkbox') {
            value = !!input.value;
          }

          // associations
          else if (input.type === 'associations') {
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
        $scope.cfg.inputs.forEach(function (input) {
          if (input.localStorage) {
            saveAsLocalStorage(input.name);
          }
        });

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
      };

      // local storage
      function getLocalStorageKey (name) {
        return 'lvdlom.saisie.' + $scope.cfg.type + '.' + name;
      };

      function saveAsLocalStorage (name) {
        localStorage.setItem(getLocalStorageKey(name), $scope.data[name]);
      };

      function getFromLocalStorage (name) {
        return localStorage.getItem(getLocalStorageKey(name));
      };

      // watch
      $scope.$watch('cfg', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          prepareInput();
        }
      }, true);

      // associations
      $scope.associationsCfg = {data: null};

      $scope.$watch('associationsCfg', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          $scope.data.associations = newValue.data;
        }
      }, true);

      // source
      $scope.sourceCfg = {data: null};

      $scope.$watch('sourceCfg', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          $scope.data.source = newValue.data;
        }
      }, true);
    }
  };
});