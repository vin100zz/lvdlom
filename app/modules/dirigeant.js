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

      $scope.links = [];
      if (dirigeant.fiche.idJoueur) {
        $scope.links.push({url: '#/joueur/' + dirigeant.fiche.idJoueur, label: 'Sa fiche joueur', icone: 'personne'});
      }
      $scope.links.push({url: '#/saisie/edit/dirigeant/' + dirigeant.id, label: 'Modifier la fiche', modifier: true});

      var navigation = function (personne) {
        return !personne.id ? null : {
          label: personne.prenom + ' ' + personne.nom,
          link: '#/dirigeant/' + personne.id
        };
      };

      $scope.breadcrumb = {
        label: 'Dirigeant précédent et suivant',
        prev: navigation($scope.dirigeant.navigation.prev),
        next: navigation($scope.dirigeant.navigation.next)
      };
      
    });
   
  });

}) ();



