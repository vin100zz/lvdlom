(function () {
  
  'use strict';
  
  // API
  app.factory('Saison', function ($resource) {
    return $resource('services/saison.php', {}, {
      get: {method: 'GET', isArray: false, cache: false}
    });
  });
  
  // controller
  app.controller('SaisonCtrl', function($scope, $injector, $routeParams, Saison) {

    $injector.invoke(AbstractModuleCtrl, this, {$scope: $scope, pageTitle: 'Saison ' + $routeParams.id});

    $scope.saison = Saison.get({id: $routeParams.id}, function () {

      var prev = !$scope.saison.navigation.prev ? null : {
        label: $scope.saison.navigation.prev,
          link: '#/saison/' + $scope.saison.navigation.prev
      };

      var next = !$scope.saison.navigation.next ? null : {
        label: $scope.saison.navigation.next,
        link: '#/saison/' + $scope.saison.navigation.next
      };

      $scope.breadcrumb = {
        prev: prev,
        next: next
      };
      
    });
  });
  
}) ();