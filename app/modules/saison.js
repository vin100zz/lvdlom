(function () {
  
  'use strict';
  
  // API
  app.factory('Saison', function ($resource) {
    return $resource('services/saison.php', {}, {
      get: {method: 'GET', isArray: false, cache: false}
    });
  });
  
  // controller
  app.controller('SaisonCtrl', function($scope, $routeParams, Saison) {
    $scope.saison = Saison.get({id: $routeParams.id}, function () {
      
      $scope.breadcrumb = {
        prev: {
          label: $scope.saison.navigation.prev,
          link: '#/saison/' + $scope.saison.navigation.prev
        },
        next: {
          label: $scope.saison.navigation.next,
          link: '#/saison/' + $scope.saison.navigation.next
        }
      };
      
    });
  });
  
}) ();