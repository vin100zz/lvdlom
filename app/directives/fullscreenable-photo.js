app.directive('lvdlomFullscreenablePhoto', function (Viewer) {
  return {
    scope: {
      src:        '@',
      photoClass: '@'
    },
    templateUrl: 'app/directives/fullscreenable-photo.html',
    controller: function ($scope) {
      // la photo s'ouvre dans la visionneuse commune
      $scope.openFullscreen = function () {
        Viewer.open([{path: $scope.src}], 0);
      };
    }
  };
});
