// interceptor
app.factory('IoInterceptor', function ($rootScope, Loading) {
  // le pré-remplissage d'un match affiche sa propre attente : il ne masque pas la page
  var isServiceQuery = function (config) {
    return config.url.indexOf('services/') === 0 && config.url.indexOf('actu.php') === -1 && config.url.indexOf('match-import.php') === -1;
  };
  
  return {
    request: function (config) {
      if (isServiceQuery(config)) {
        Loading.increaseNbQueriesInProgress();
      }
      return config;
    },
    response: function (response) {
      if (isServiceQuery(response.config)) {
        Loading.decreaseNbQueriesInProgress();
      }
      return response;
    },
    responseError: function (rejection) {
      if (isServiceQuery(rejection.config)) {
        Loading.decreaseNbQueriesInProgress();
      }
      $rootScope.$broadcast('alert.new', 'error', 'Oups, y\'a un blème...');
      return rejection;
    }
  };
});

app.config(['$httpProvider', function ($httpProvider) {
  $httpProvider.interceptors.push('IoInterceptor');
}]);