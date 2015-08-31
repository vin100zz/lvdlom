(function () {
  
  'use strict';

  // API
  app.factory('Match', function ($resource) {
    return $resource('services/match.php', {}, {
      get: {method: 'GET', isArray: false, cache: false}
    });
  });
  
  // controller
  app.controller('MatchCtrl', function($scope, $routeParams, Match, Bom, Formatter) {
    $scope.Formatter = Formatter;
    
    $scope.match = Match.get({id: $routeParams.id}, function () {

      var prev = !$scope.match.navigation.prev.id ? null : {
        label: Formatter.match($scope.match.navigation.prev) + ' ' + Formatter.score(Formatter.$Score.big, $scope.match.navigation.prev),
          link: '#/match/' + $scope.match.navigation.prev.id
      };

      var next = !$scope.match.navigation.next.id ? null : {
        label: Formatter.match($scope.match.navigation.next) + ' ' + Formatter.score(Formatter.$Score.big, $scope.match.navigation.next),
          link: '#/match/' + $scope.match.navigation.next.id
      };

      $scope.breadcrumb = {
        prev: prev,
        next: next
      };

    });
  });

}) ();


