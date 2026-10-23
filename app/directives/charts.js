app.directive('lvdlomCharts', function () {
  return {
    scope: {
      cfg: '='
    },
    templateUrl: 'app/directives/charts.html',
    controller: function ($scope) {

      $scope.uniqueId = 'id-' + Math.floor(Math.random()*10000000000);

      // total affiché au centre de l'anneau
      $scope.total = function () {
        var values = ($scope.cfg && $scope.cfg.main && $scope.cfg.main.data.value) || [];
        return values.reduce(function (sum, value) {
          return sum + (parseInt(value, 10) || 0);
        }, 0);
      };

      var prepareData = function (config) {
        return config.data.value.map(function (value, index) {
          var settings = config.settings[index];
          settings.value = value;
          return settings;
        });
      };
      
      var render = function () {
        if (!$scope.cfg) {
          return;
        }

        var container = window.document.querySelector('#' + $scope.uniqueId);
        if (!container) {
          return;
        }

        // anneaux fins, séparés par un liseré blanc (charte · bilan)
        var options = angular.extend({
          tooltipFontSize: 10,
          showTooltips: false,
          segmentStrokeColor: '#FFFFFF',
          segmentStrokeWidth: 2,
          percentageInnerCutout: 78,
          animationSteps: 40
        }, $scope.cfg.main.chartjsCfg || {});

        if ($scope.mainChart) {
          $scope.mainChart.destroy();
        }
        $scope.mainData = prepareData($scope.cfg.main);
        $scope.mainChart = new Chart(container.querySelector('.main').getContext("2d")).Doughnut($scope.mainData, options);

        if ($scope.innerChart) {
          $scope.innerChart.destroy();
        }
        if ($scope.cfg.inner) {
          $scope.innerData = prepareData($scope.cfg.inner);
          $scope.innerChart = new Chart(container.querySelector('.inner').getContext("2d")).Doughnut($scope.innerData, angular.extend({}, options, {percentageInnerCutout: 74}));
        }
      };
      
      window.setTimeout(render, 500);
      
      $scope.$watch('cfg', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          render();
        }
      }, true);
    }
  };
});