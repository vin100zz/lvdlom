app.directive('lvdlomCharts', function () {
  return {
    scope: {
      cfg: '='
    },
    templateUrl: 'app/directives/charts.html',
    controller: function ($scope) {

      $scope.uniqueId = 'id-' + Math.floor(Math.random()*10000000000);

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

        var options = $scope.cfg.main.chartjsCfg || {};
        options.tooltipFontSize = 10;
        options.showTooltips = false;
        
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
          $scope.innerChart = new Chart(container.querySelector('.inner').getContext("2d")).Pie($scope.innerData, options);
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