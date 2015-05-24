// service
app.service('Loading', function ($rootScope) {
  var loading = false;
  var silent = false;
  
  this.silent = function () {
    silent = true;
  };
  this.isLoading = function () {
    return loading;
  };
  this.setLoading = function (value) {
    if (!silent) {
      loading = value;
      $rootScope.$broadcast('loading.update');
    }
    silent = false;
  };
});

// interceptor
app.factory('LoadingInterceptor', function (Loading) {
  return {
    request: function (config) {
      Loading.setLoading(true);
      return config;
    },
    response: function (response) {
      Loading.setLoading(false);
      return response;
    }
  };
});

app.config(['$httpProvider', function ($httpProvider) {
  $httpProvider.interceptors.push('LoadingInterceptor');
}]);