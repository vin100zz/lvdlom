// service
app.service('Loading', function ($rootScope) {
  var nbQueriesInProgress = 0;
  var silent = false;
  
  this.silent = function () {
    silent = true;
  };
  this.isLoading = function () {
    //console.log('isLoading', nbQueriesInProgress);
    return nbQueriesInProgress > 0;
  };
  this.increaseNbQueriesInProgress = function () {
    if (!silent) {
      ++nbQueriesInProgress;
      //console.log('increase', nbQueriesInProgress);
      $rootScope.$broadcast('loading.update');
    }
    silent = false;
  };
  this.decreaseNbQueriesInProgress = function () {
    if (!silent) {
      --nbQueriesInProgress;
      //console.log('decrease', nbQueriesInProgress);
      $rootScope.$broadcast('loading.update');
    }
    silent = false;
  };
});

// interceptor
app.factory('LoadingInterceptor', function (Loading) {
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
    }
  };
});

app.config(['$httpProvider', function ($httpProvider) {
  $httpProvider.interceptors.push('LoadingInterceptor');
}]);