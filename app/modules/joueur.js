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
        {url: '#/matches-joueur/' + joueur.id, label: 'Ses matches', icone: 'matches'},
        {fn: $scope.openBiographie, label: 'Biographie', ia: true, title: 'Biographie générée par IA'}
      ];
      if (joueur.documents && joueur.documents.length) {
        $scope.links.push({fn: $scope.openDocumentsResume, label: 'Résumé des documents', ia: true, title: 'Résumé des documents généré par IA'});
      }
      if (joueur.dirigeant) {
        $scope.links.push({url: '#/dirigeant/' + joueur.dirigeant, label: 'Sa fiche dirigeant', icone: 'personne'});
      }
      $scope.links.push({url: '#/saisie/edit/joueur/' + joueur.id, label: 'Modifier la fiche', modifier: true});

      var navigation = function (personne) {
        return !personne.id ? null : {
          label: personne.prenom + ' ' + personne.nom,
          link: '#/joueur/' + personne.id
        };
      };

      $scope.breadcrumb = {
        label: 'Joueur précédent et suivant',
        prev: navigation($scope.joueur.navigation.prev),
        next: navigation($scope.joueur.navigation.next)
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



