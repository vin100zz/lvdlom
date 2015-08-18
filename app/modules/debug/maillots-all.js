(function () {
  
  'use strict';
  
  // controller
  app.controller('DebugMaillotsAllCtrl', function($scope, $routeParams, Adversaires) {
    
    Adversaires.get([], function (adversaires) {

      var index = parseInt($routeParams.index, 10);
    
      $scope.adversaires = adversaires.slice(index, index + 30);
      
      $scope.maillots = $scope.adversaires.map(function (adv) {
        return {
          idClub: adv.idAdv,
          nomClub: adv.nomAdv          
        };
      });
      
    });
    
  });
  
}) ();
