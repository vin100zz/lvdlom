// interceptor
app.factory('IoInterceptor', function ($rootScope, Loading) {
  var isServiceQuery = function (config) {
    return config.url.indexOf('services/') === 0;
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
      Loading.decreaseNbQueriesInProgress();
      $rootScope.$broadcast('alert.new', 'error', 'Oups, y\'a un blème...');
      return rejection;
    }
  };
});

app.config(['$httpProvider', function ($httpProvider) {
  $httpProvider.interceptors.push('IoInterceptor');
}]);