'use strict';

// API
app.factory('Match', function ($resource) {
  return $resource('services/match.php', {}, {
    get: {method: 'GET', isArray: false, cache: true}
  });
});

// controller
app.controller('MatchCtrl', function($scope, $routeParams, Joueur) {
  $scope.joueur = Match.get({id: $routeParams.id});
  
  $scope.maillot = {
    id: 'maillot',
    template: 3,
    color1: '#ffffff',
    color2: '#ff0000',
    color3: '#000000'
  };
  
  $scope.maillot2 = {
      id: 'maillot2',
      template: 5,
      color1: '#FFD800',
      color2: '#007F0E',
      color3: '#FFFFFF'
    };
  
  $scope.maillot3 = {
      id: 'maillot3',
      template: 7,
      color1: '#FF0000',
      color2: '#0000FF',
      color3: '#000000'
    };
  
  $scope.maillot4 = {
      id: 'maillot4',
      template: 4,
      color1: '#ffffff',
      color2: '#0000FF',
      color3: '#FF0000'
    };
  
  $scope.maillot5 = {
      id: 'maillot5',
      template: 29,
      color1: '#000000',
      color2: '#FFFFFF',
      color3: '#FF0000'
    };
 
});




