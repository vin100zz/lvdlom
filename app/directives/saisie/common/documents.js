app.directive('lvdlomSaisieDocuments', function () {
  return {
    scope: {
      cfg: '='
    },
    templateUrl: 'app/directives/saisie/common/documents.html',
    controller: function ($scope, $rootScope, Saisie) {

      $scope.cfg.data = [{type: 'a', id: 'b'}];

      $scope.docTypes = [
        {key: 'M', label: 'Match'},
        {key: 'J', label: 'Joueur'},
        {key: 'D', label: 'Dirigeant'},
        {key: 'S', label: 'Saison'}
      ];

    }
  };
});