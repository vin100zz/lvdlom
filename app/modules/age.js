(function () {
  
  'use strict';
  
  // API
  app.factory('AgeJoueurs', function ($resource) {
    return $resource('services/age.php', {type: 'min'}, {
      get: {method: 'GET', isArray: true, cache: false}
    });
  });
  
  // controller
  app.controller('AgeCtrl', function($scope, $injector, AgeJoueurs) {

    $injector.invoke(AbstractModuleCtrl, this, {$scope: $scope, pageTitle: 'Âges Joueurs'});

    $scope.listes = [
      {titre: 'Plus jeunes joueurs', meta: 'âge au 1er match', joueurs: AgeJoueurs.get({type: 'match', sort: 'min'})},
      {titre: 'Plus vieux joueurs', meta: 'âge au dernier match', joueurs: AgeJoueurs.get({type: 'match', sort: 'max'})},
      {titre: 'Plus jeunes buteurs', meta: 'âge au 1er but', joueurs: AgeJoueurs.get({type: 'but', sort: 'min'})},
      {titre: 'Plus vieux buteurs', meta: 'âge au dernier but', joueurs: AgeJoueurs.get({type: 'but', sort: 'max'})}
    ];
  });
  
}) ();