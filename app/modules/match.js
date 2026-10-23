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

      var navigation = function (match) {
        return !match.id ? null : {
          label: Formatter.match(match) + ' ' + Formatter.score(Formatter.$Score.big, match),
          link: '#/match/' + match.id
        };
      };

      $scope.breadcrumb = {
        label: 'Match précédent et suivant',
        prev: navigation($scope.match.navigation.prev),
        next: navigation($scope.match.navigation.next)
      };

    });
  });

}) ();


