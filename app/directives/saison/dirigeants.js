app.directive('lvdlomDirigeantsSaison', function (Formatter) {
  return {
    scope: {
      saison: '='
    },
    templateUrl: 'app/directives/saison/dirigeants.html',
    controller: function ($scope) {
      $scope.Formatter = Formatter;
    }
  };
});