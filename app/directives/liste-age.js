app.directive('lvdlomListeAge', function (Bom) {
  
  return {
    scope: {
      joueurs: '='
    },
    templateUrl: 'app/directives/liste-age.html',
    controller: function ($scope) {
      $scope.Bom = Bom;
    }
  };
});
 
 

      
