(function () {
  
  'use strict';
  
  // API
  app.factory('Saison', function ($resource) {
    return $resource('services/saison.php', {}, {
      get: {method: 'GET', isArray: false, cache: true}
    });
  });
  
  // controller
  app.controller('SaisonCtrl', function($scope, $routeParams, Saison) {
    $scope.saison = Saison.get({id: $routeParams.id});
  });
  
}) ();