(function () {
  
  'use strict';
  
  // API
  app.factory('Day', function ($resource) {
    return $resource('services/date.php', {}, {
      get: {method: 'GET', isArray: false, cache: true}
    });
  });
  
  // controller
  app.controller('DayCtrl', function($scope, $routeParams, Day, Bom, Formatter, Picture, DateTime) {
    $scope.Bom = Bom;
    $scope.Picture = Picture;
    $scope.DateTime = DateTime;
    
    $scope.model = Day.get({date: $routeParams.date}, function () {
      var month = parseInt($scope.model.date.substr(0, 2), 10);
      var day = parseInt($scope.model.date.substr(3, 2), 10);
      var date = new Date(new Date().getFullYear(), month-1, day);
  
      var prev = new Date(date.getTime() - 1000 * 60 * 60 * 24);
      var next = new Date(date.getTime() + 1000 * 60 * 60 * 24);
      
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