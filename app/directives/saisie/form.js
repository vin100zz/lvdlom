app.directive('lvdlomSaisieForm', function () {
  return {
    scope: {
      cfg: '='
    },
    templateUrl: 'app/directives/saisie/form.html',
    controller: function ($scope) {

      $scope.data = {};

      $scope.showInputElement = function (type) {
        return ['text', 'date', 'checkbox'].indexOf(type) >= 0;
      };

      $scope.submit = function (data) {
        console.log(data);
      };
      
    }
  };
});