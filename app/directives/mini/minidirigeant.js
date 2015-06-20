app.controller('MiniDirigeantCtrl', function($scope, Dirigeant, Picture, Loading) {
  $scope.Picture = Picture;
  
  $scope.$watch('selected.id', function (newValue, oldValue) {
    if (newValue !== oldValue) {
      if (newValue) {
        Loading.silent();
        $scope.loading = true;
        $scope.dirigeant = Dirigeant.get({id: newValue}, function () {$scope.loading = false;});
      } else {
        $scope.dirigeant = null;
      }
    }
  }, true);
  
});