(function () {
  
  'use strict';
  
  // controller
  app.controller('DebugMaillotsCtrl', function($scope, Adversaires) {
    
    Adversaires.get([], function (adversaires) {
      
      $scope.adversaires = adversaires.slice(0, 30);
      
      $scope.maillots = $scope.adversaires.map(function (adv) {
        return {
          idClub: adv.idAdv,
          nomClub: adv.nomAdv          
        };
      });
      
    });
    
  });
  
}) ();
