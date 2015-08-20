(function () {
  
  'use strict';
  
  // API
  app.factory('Saisie', function ($resource) {
    return $resource('services/age.php', {type: 'min'}, {
      get: {method: 'GET', isArray: true, cache: true}
    });
  });
  
  // controller
  app.controller('SaisieCtrl', function($scope, Saisie) {
    
  });
  
}) ();