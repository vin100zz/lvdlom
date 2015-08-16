app.directive('lvdlomListeAge', function (Bom, Formatter) {
  
  return {
    scope: {
      joueurs: '='
    },
    templateUrl: 'app/directives/liste-age.html',
    controller: function ($scope) {
      $scope.Bom = Bom;
      $scope.Formatter = Formatter;
    }
  };
});
 
 

      
