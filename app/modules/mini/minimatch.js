app.controller('MiniMatchCtrl', function($scope, Match, Loading) {
  
  $scope.$watch('selected.id', function (newValue, oldValue) {
    if (newValue !== oldValue) {
      if (newValue) {
        Loading.silent();
        $scope.loading = true;
        $scope.match = Match.get({id: newValue}, function (match) {
          
          $scope.cfg = {
            mini: true
          };        
          
          $scope.loading = false;
        });
      } else {
        $scope.match = null;
      }
    }
  }, true);
  
});