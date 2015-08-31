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

      var prev = !$scope.dirigeant.navigation.prev.id ? null : {
        label: $scope.dirigeant.navigation.prev.prenom + ' ' + $scope.dirigeant.navigation.prev.nom,
        link: '#/dirigeant/' + $scope.dirigeant.navigation.prev.id
      };

      var next = !$scope.dirigeant.navigation.next.id ? null : {
        label: $scope.dirigeant.navigation.next.prenom + ' ' + $scope.dirigeant.navigation.next.nom,
        link: '#/dirigeant/' + $scope.dirigeant.navigation.next.id
      };

      $scope.breadcrumb = {
        prev: prev,
        next: next
      };
      
    });
   
  });

}) ();



