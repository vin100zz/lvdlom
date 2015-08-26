app.directive('lvdlomSaisieAssociations', function () {
  return {
    scope: {
      cfg: '='
    },
    templateUrl: 'app/directives/saisie/common/associations.html',
    controller: function ($scope, $rootScope, Dictionary) {

      $scope.docTypes = [
        {key: 'M', label: 'Match'},
        {key: 'J', label: 'Joueur'},
        {key: 'D', label: 'Dirigeant'},
        {key: 'S', label: 'Saison'}
      ];

      $scope.dictionary = {
        matches: Dictionary.matches(),
        joueurs: Dictionary.joueurs(),
        dirigeants: Dictionary.dirigeants(),
        saisons: Dictionary.saisons()
      };

      $scope.cfg.data = [getNewAssociation()];

      function getNewAssociation () {
        return {type: null, id: null};
      };

      $scope.addRow = function (evt) {
        evt.preventDefault();
        $scope.cfg.data.push(getNewAssociation());
      };

      $scope.deleteRow = function (evt, index) {
        evt.preventDefault();
        $scope.cfg.data.splice(index, 1);
      };     

    }
  };
});