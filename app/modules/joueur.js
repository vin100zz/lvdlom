(function () {
  
  'use strict';
  
  // API
  app.factory('Joueur', function ($resource) {
    return $resource('services/joueur.php', {}, {
      get: {method: 'GET', isArray: false, cache: false}
    });
  });
  
  // controller
  app.controller('JoueurCtrl', function($scope, $injector, $routeParams, Joueur) {

    $injector.invoke(AbstractModuleCtrl, this, {$scope: $scope, pageTitle: null});

    $scope.joueur = Joueur.get({id: $routeParams.id}, function (joueur) {

      $scope.setPageTitle(joueur.fiche.prenom + ' ' + joueur.fiche.nom);

      $scope.links = [
        {url: '#/matches-joueur/' + joueur.id, label: 'Matches'},
        {fn: $scope.openBiographie, label: 'Biographie', icon: 'style/img/AI.png'}
      ];
      if (joueur.documents && joueur.documents.length) {
        $scope.links.push({fn: $scope.openDocumentsResume, label: 'Documents', icon: 'style/img/AI.png'});
      }
      if (joueur.dirigeant) {
        $scope.links.push({url: '#/dirigeant/' + joueur.dirigeant, label: 'Dirigeant'});
      };

      var prev = !$scope.joueur.navigation.prev.id ? null : {
        label: $scope.joueur.navigation.prev.prenom + ' ' + $scope.joueur.navigation.prev.nom,
        link: '#/joueur/' + $scope.joueur.navigation.prev.id
      };

      var next = !$scope.joueur.navigation.next.id ? null : {
        label: $scope.joueur.navigation.next.prenom + ' ' + $scope.joueur.navigation.next.nom,
        link: '#/joueur/' + $scope.joueur.navigation.next.id
      };

      $scope.breadcrumb = {
        prev: prev,
        next: next
      };

    });

    $scope.biographieVisible = false;
    $scope.openBiographie = function () {
      $scope.biographieVisible = true;
    };
    $scope.closeBiographie = function () {
      $scope.biographieVisible = false;
    };

    $scope.documentsResumeVisible = false;
    $scope.openDocumentsResume = function () {
      $scope.documentsResumeVisible = true;
    };
    $scope.closeDocumentsResume = function () {
      $scope.documentsResumeVisible = false;
    };

  });

}) ();



