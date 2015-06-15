(function () {
  
  'use strict';
  
  // API
  app.factory('Day', function ($resource) {
    return $resource('services/date.php', {}, {
      get: {method: 'GET', isArray: false, cache: true}
    });
  });
  
  // controller
  app.controller('DayCtrl', function($scope, $routeParams, Day, Match, Joueur, DateTime) {
    $scope.DateTime = DateTime;
    
    $scope.matches = [];
    $scope.joueurs = [];
    $scope.dirigeants = [];
    
    $scope.model = Day.get({date: $routeParams.date}, function () {
      
      // fetch data
      var fetchData = function (key, factory) {
        $scope.model[key].forEach(function (raw) {
          factory.get({id: raw.id}, function (data) {
            $scope[key].push(data);
          });        
        });
      };
      
      fetchData('matches', Match);
      fetchData('joueurs', Joueur);
      
      // breadcrumb
      var month = parseInt($scope.model.date.substr(0, 2), 10);
      var day = parseInt($scope.model.date.substr(3, 2), 10);
      var date = new Date(new Date().getFullYear(), month-1, day);
  
      var prev = new Date(date.getTime() - 1000 * 60 * 60 * 24);
      var next = new Date(date.getTime() + 1000 * 60 * 60 * 24);
      
      $scope.current = DateTime.format(date, 'd MMMM');
      
      $scope.breadcrumb = {
        prev: {
          label: DateTime.format(prev, 'd MMMM'),
          link: '#/date/' + DateTime.format(prev, 'MM-dd')
        },
        next: {
          label: DateTime.format(next, 'd MMMM'),
          link: '#/date/' + DateTime.format(next, 'MM-dd')
        }
      };
    });
  });
  
}) ();