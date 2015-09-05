(function () {
  
  'use strict';

  // API
  app.factory('Match', function ($resource) {
    return $resource('services/match.php', {}, {
      get: {method: 'GET', isArray: false, cache: false}
    });
  });
  
  // controller
  app.controller('MatchCtrl', function($scope, $injector, $routeParams, Match, Bom, Formatter) {

    $injector.invoke(AbstractModuleCtrl, this, {$scope: $scope, pageTitle: null});

    $scope.Formatter = Formatter;
    
    $scope.match = Match.get({id: $routeParams.id}, function () {

      $scope.setPageTitle(Formatter.matchTitle($scope.match) + ' ' +  Formatter.score(Formatter.$Score.big, $scope.match.fiche));

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


