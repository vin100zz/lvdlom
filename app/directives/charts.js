app.directive('lvdlomCharts', function () {
  return {
    scope: {
      cfg: '='
    },
    templateUrl: 'app/directives/charts.html',
    controller: function ($scope) {
      var prepareData = function (config) {
        return config.data.value.map(function (value, index) {
          var settings = config.settings[index];
          settings.value = value;
          return settings;
        });
      };
      
      var options = {
        tooltipFontSize: 10,
        showTooltips: false
      };
      var optionsInner = options;
      optionsInner.segmentStrokeWidth = 2;
      
      var render = function () {
        if ($scope.mainChart) {
          $scope.mainChart.destroy();
        }
        $scope.mainData = prepareData($scope.cfg.main);
        $scope.mainChart = new Chart(window.document.querySelector("#charts .main").getContext("2d")).Doughnut($scope.mainData, options);
        
        if ($scope.innerChart) {
          $scope.innerChart.destroy();
        }
        $scope.innerData = prepareData($scope.cfg.inner);
        $scope.innerChart = new Chart(window.document.querySelector("#charts .inner").getContext("2d")).Pie($scope.innerData, optionsInner);
      };
      
      $scope.$watch('cfg', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          render();
        }
      }, true);
    }
  };
});