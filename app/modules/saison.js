(function () {
  
  'use strict';
  
  // API
  app.factory('Saison', function ($resource) {
    return $resource('services/saison.php', {}, {
      get: {method: 'GET', isArray: false, cache: false}
    });
  });
  
  // controller
  app.controller('SaisonCtrl', function($scope, $injector, $routeParams, Saison, Saisons, Picture) {

    $injector.invoke(AbstractModuleCtrl, this, {$scope: $scope, pageTitle: 'Saison ' + $routeParams.id});

    $scope.ecussonOm = Picture.club('OM', $routeParams.id);

    // la photo d'équipe n'existe pas pour toutes les saisons
    var photo = new Image();
    photo.onload = function () {
      $scope.photoEquipe = true;
      $scope.$applyAsync();
    };
    photo.src = Picture.saison($routeParams.id);

    $scope.saison = Saison.get({id: $routeParams.id}, function () {

      var navigation = function (saison) {
        return !saison ? null : {
          label: 'Saison ' + saison,
          link: '#/saison/' + saison
        };
      };

      $scope.breadcrumb = {
        label: 'Saison précédente et suivante',
        prev: navigation($scope.saison.navigation.prev),
        next: navigation($scope.saison.navigation.next)
      };
      
    });

    // bilan de la saison, tel que la liste des saisons le calcule
    Saisons.get(function (saisons) {
      var saison = saisons.filter(function (s) {
        return s.id === $routeParams.id;
      })[0];
      if (!saison) {
        return;
      }
      var n = function (value) {
        return parseInt(value, 10) || 0;
      };
      $scope.bilan = [
        {label: n(saison.nbVictoires) > 1 ? 'victoires' : 'victoire', valeur: n(saison.nbVictoires), or: true},
        {label: n(saison.nbNuls) > 1 ? 'nuls' : 'nul', valeur: n(saison.nbNuls)},
        {label: n(saison.nbDefaites) > 1 ? 'défaites' : 'défaite', valeur: n(saison.nbDefaites)},
        {label: 'buts pour', valeur: n(saison.bp)},
        {label: 'buts contre', valeur: n(saison.bc)}
      ];
    });
  });
  
}) ();
