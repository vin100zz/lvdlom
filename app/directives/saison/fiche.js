app.directive('lvdlomFicheSaison', function () {
  return {
    scope: {
      saison: '='
    },
    templateUrl: 'app/directives/saison/fiche.html',
    controller: function ($scope, Picture) {
      $scope.Picture = Picture;
    }
  };
});