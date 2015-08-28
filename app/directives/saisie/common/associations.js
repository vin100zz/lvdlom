app.directive('lvdlomSaisieAssociations', function () {
  return {
    scope: {
      cfg: '='
    },
    templateUrl: 'app/directives/saisie/common/associations.html',
    controller: function ($scope, $rootScope, Dictionary, Formatter) {

      $scope.docTypes = [
        {key: 'M', label: 'Match'},
        {key: 'J', label: 'Joueur'},
        {key: 'D', label: 'Dirigeant'},
        {key: 'S', label: 'Saison'}
      ];

      $scope.dictionary = {
        matches: formatMatches(Dictionary.matches()),
        joueurs: Dictionary.joueurs(),
        dirigeants: Dictionary.dirigeants(),
        saisons: Dictionary.saisons()
      };

      $scope.cfg.data = [getNewAssociation()];

      function formatMatches (matches) {
        return matches.map(function (match) {
          var data = match.label.split(',');
          match.label = '[' + Formatter.dateLong(data[1]) + '] ' + data[0] + ' ' + data[2] + '-' + data[3];
          return match;
        }).reverse();
      };

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