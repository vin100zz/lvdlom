(function () {
  
  'use strict';
  
  // API
  app.factory('Day', function ($resource) {
    return $resource('services/date.php', {}, {
      get: {method: 'GET', isArray: false, cache: true}
    });
  });
  
  // controller
  app.controller('DayCtrl', function($scope, $routeParams, Day, Match, Joueur, Formatter, DateTime) {
    $scope.Formatter = Formatter;
    
    $scope.age = function (date) {
      return Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24 * 365));
    };
    
    $scope.matches = [];
    $scope.joueurs = [];
    $scope.dirigeants = [];
    
    $scope.model = Day.get({date: $routeParams.date}, function () {
      
      // fetch data
      var fetchData = function (key, dateKey, factory) {
        $scope.model[key].forEach(function (raw) {
          factory.get({id: raw.id}, function (data) {
            $scope[key].push(data);
            $scope[key].sort(function (data1, data2) {
              return data1.fiche[dateKey].localeCompare(data2.fiche[dateKey]);
            });
          });        
        });
      };
      
      fetchData('matches', 'date', Match);
      fetchData('joueurs', 'dateNaissance', Joueur);
      
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