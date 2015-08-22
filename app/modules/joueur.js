(function () {
  
  'use strict';
  
  // API
  app.factory('Joueur', function ($resource) {
    return $resource('services/joueur.php', {}, {
      get: {method: 'GET', isArray: false, cache: false}
    });
  });
  
  // controller
  app.controller('JoueurCtrl', function($scope, $routeParams, Joueur) {
    $scope.joueur = Joueur.get({id: $routeParams.id}, function () {

      $scope.breadcrumb = {
        prev: {
          label: $scope.joueur.navigation.prev.prenom + ' ' + $scope.joueur.navigation.prev.nom,
          link: '#/joueur/' + $scope.joueur.navigation.prev.id
        },
        next: {
          label: $scope.joueur.navigation.next.prenom + ' ' + $scope.joueur.navigation.next.nom,
          link: '#/joueur/' + $scope.joueur.navigation.next.id
        }
      };
      
    });
   
  });

}) ();



