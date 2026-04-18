app.directive('lvdlomModal', function () {
  return {
    scope: {
      isOpen: '=',
      title:  '@',
      onClose: '&'
    },
    transclude: true,
    templateUrl: 'app/directives/modal.html',
    controller: function ($scope) {
      $scope.close = function () {
        $scope.isOpen = false;
        if ($scope.onClose) {
          $scope.onClose();
        }
      };
    }
  };
});

