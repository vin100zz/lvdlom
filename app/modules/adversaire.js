(function () {
  
  'use strict';

  // API
  app.factory('Adversaire', function ($resource) {
    return $resource('services/adversaire.php', {}, {
      get: {method: 'GET', isArray: false, cache: false}
    });
  });

}) ();


