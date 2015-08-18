(function () {
  
  'use strict';
  
  // controller
  app.controller('DebugMaillotsDesignCtrl', function($scope, $routeParams, Adversaires, Picture) {
    $scope.Picture = Picture;
    
    $scope.adversaires = Adversaires.get(null, function (adversaires) {
      $scope.adversaire = adversaires[0];
      $scope.selectedAdvId = $scope.adversaire.id;
      refreshMaillots();
    });    

    $scope.color1 = '#FF0000';
    $scope.color2 = '#FFFFFF';
    $scope.color3 = '#0000FF';

    $scope.selectedTemplate = 1;

    $scope.selectTemplate = function (template) {
      $scope.selectedTemplate = template;
    };

    $scope.selectAdv = function () {
      $scope.adversaire = $scope.adversaires.find(function (adversaire) {
        return adversaire.id === parseInt($scope.selectedAdvId, 10);
      }); 
    };

    var refreshMaillots = function () {
      $scope.maillots = Array.apply(null, {length: 56}).map(function (unused, index) {
        return {
          idClub: $scope.adversaire.id,
          debug: {
            canvasId: 'maillot-' + (index+1),
            template: index+1,
            color1: $scope.color1.substr(1),
            color2: $scope.color2.substr(1),
            color3: $scope.color3.substr(1)
          }     
        };
      });
    };

    var refresh = function (newValue, oldValue) {
      if (newValue !== oldValue) {
        refreshMaillots();
      }
    };

    $scope.$watch('color1', refresh, true);
    $scope.$watch('color2', refresh, true);
    $scope.$watch('color3', refresh, true);
    $scope.$watch('selectedAdvId', refresh, true);
    
  });
  
}) ();
