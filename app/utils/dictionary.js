app.service('Dictionary', function ($http) {
  
  var dictionary = {};
  
  this.init = $http.get('services/dictionary.php')
  .success(function (data, status, headers, config) {
    dictionary = data;
  });
  
  this.nationalites = function () {
    return dictionary['nationalites'];
  };
  
  this.saisons = function () {
    return dictionary['saisons'];
  };
  
  this.adversaires = function () {
    return dictionary['adversaires'];
  };
});
