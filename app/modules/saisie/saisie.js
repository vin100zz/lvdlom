(function () {
  
  'use strict';
  
  // API
  app.factory('Saisie', function ($resource) {
    return $resource('services/saisie.php', null, {
      save: {method: 'POST', isArray: false, cache: false}
    });
  });
  
  // controller
  app.controller('SaisieCtrl', function($scope, $routeParams, Saisie) {

    $scope.action = $routeParams.action || 'new';
    $scope.type = $routeParams.type || null;
    $scope.id = $routeParams.id || null;

    $scope.cfg = {
      id: $scope.id
    };
    
  });
  
}) ();