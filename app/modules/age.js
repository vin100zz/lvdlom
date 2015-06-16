(function () {
  
  'use strict';
  
  // API
  app.factory('AgeJoueurs', function ($resource) {
    return $resource('services/age.php', {type: 'min'}, {
      get: {method: 'GET', isArray: true, cache: true}
    });
  });
  
  // controller
  app.controller('AgeCtrl', function($scope, AgeJoueurs) {
    $scope.joueursMin = AgeJoueurs.get({type: 'match', sort: 'min'});
    $scope.joueursMax = AgeJoueurs.get({type: 'match', sort: 'max'});
    $scope.buteursMin = AgeJoueurs.get({type: 'but', sort: 'min'});
    $scope.buteursMax = AgeJoueurs.get({type: 'but', sort: 'max'});
  });
  
}) ();