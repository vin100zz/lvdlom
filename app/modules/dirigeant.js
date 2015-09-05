(function () {
  
  'use strict';
  
  // API
  app.factory('Dirigeant', function ($resource) {
    return $resource('services/dirigeant.php', {}, {
      get: {method: 'GET', isArray: false, cache: false}
    });
  });
  
  // controller
  app.controller('DirigeantCtrl', function($scope, $injector, $routeParams, Dirigeant) {

    $injector.invoke(AbstractModuleCtrl, this, {$scope: $scope, pageTitle: null});

    $scope.dirigeant = Dirigeant.get({id: $routeParams.id}, function (dirigeant) {

      $scope.setPageTitle(dirigeant.fiche.prenom + ' ' + dirigeant.fiche.nom);

      if (dirigeant.fiche.idJoueur) {
        $scope.links = [
          {url: '#/joueur/' + dirigeant.fiche.idJoueur, label: 'Joueur'}
        ];
      };

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



