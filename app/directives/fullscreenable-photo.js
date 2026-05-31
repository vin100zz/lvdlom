app.directive('lvdlomFullscreenablePhoto', function () {
  return {
    scope: {
      src:        '@',
      photoClass: '@'
    },
    templateUrl: 'app/directives/fullscreenable-photo.html',
    controller: function ($scope) {
      $scope.ui = { fullscreen: false };
      $scope.openFullscreen  = function () { $scope.ui.fullscreen = true;  };
      $scope.closeFullscreen = function () { $scope.ui.fullscreen = false; };
    }
  };
});

