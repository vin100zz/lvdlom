(function () {
  
  'use strict';
  
  // API
  app.factory('Dirigeant', function ($resource) {
    return $resource('services/dirigeant.php', {}, {
      get: {method: 'GET', isArray: false, cache: false}
    });
  });
  
  // controller
  app.controller('DirigeantCtrl', function($scope, $routeParams, Dirigeant) {
    $scope.dirigeant = Dirigeant.get({id: $routeParams.id}, function () {

      $scope.breadcrumb = {
        prev: {
          label: $scope.dirigeant.navigation.prev.prenom + ' ' + $scope.dirigeant.navigation.prev.nom,
          link: '#/dirigeant/' + $scope.dirigeant.navigation.prev.id
        },
        next: {
          label: $scope.dirigeant.navigation.next.prenom + ' ' + $scope.dirigeant.navigation.next.nom,
          link: '#/dirigeant/' + $scope.dirigeant.navigation.next.id
        }
      };
      
    });
   
  });

}) ();



