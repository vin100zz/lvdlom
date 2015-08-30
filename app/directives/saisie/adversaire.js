app.directive('lvdlomSaisieAdversaire', function () {
  return {
    scope: {
      cfg: '='
    },
    templateUrl: 'app/directives/saisie/common/abstract.html',
    controller: function ($scope, Adversaire, Dictionary) {

      $scope.adversaire = {};

      if ($scope.cfg.id) {
        Adversaire.get({id: $scope.cfg.id}, function (adversaire) {
          $scope.adversaire = adversaire;
          $scope.formCfg = getFormCfg();
        });
      } else {
        $scope.formCfg = getFormCfg();
      }

      function cb (data, dbResult) {
        // do nothing
      }

      function getFormCfg() {
        return {
          id: $scope.cfg.id,
          type: 'adversaire',
          cb: cb,
          inputs: [{
            name: 'nom',
            label: 'Nom',
            value: $scope.adversaire.nom,
            type: 'text',
            placeholder: 'En majuscules',
            required: true
          }, {
            name: 'pays',
            label: 'Pays',
            value: $scope.adversaire.pays,
            type: 'select',
            options: Dictionary.allNationalites(),
            required: true
          }]
        };
      }

    }
  };
});