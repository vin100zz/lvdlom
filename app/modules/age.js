(function () {
  
  'use strict';
  
  // API
  app.factory('AgeJoueurs', function ($resource) {
    return $resource('services/age.php', {type: 'min'}, {
      get: {method: 'GET', isArray: true, cache: false}
    });
  });
  
  // controller
  app.controller('AgeCtrl', function($scope, $injector, AgeJoueurs) {

    $injector.invoke(AbstractModuleCtrl, this, {$scope: $scope, pageTitle: 'Âges Joueurs'});

    $scope.joueursMin = AgeJoueurs.get({type: 'match', sort: 'min'});
    $scope.joueursMax = AgeJoueurs.get({type: 'match', sort: 'max'});
    $scope.buteursMin = AgeJoueurs.get({type: 'but', sort: 'min'});
    $scope.buteursMax = AgeJoueurs.get({type: 'but', sort: 'max'});
  });
  
}) ();