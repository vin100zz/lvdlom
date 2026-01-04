(function () {
  
  'use strict';
  
  // API
  app.factory('Origines', function ($resource) {
    return $resource('services/origines.php', {}, {
      get: {method: 'GET', isArray: false, cache: false}
    });
  });
  
  // controller
  app.controller('OriginesCtrl', function($scope, $injector, $routeParams, Origines) {

    $injector.invoke(AbstractModuleCtrl, this, {$scope: $scope, pageTitle: 'Origines'});

    // data
    $scope.origines = Origines.get();

  });
  
}) ();