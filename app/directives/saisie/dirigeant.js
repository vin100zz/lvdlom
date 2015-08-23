app.directive('lvdlomSaisieDirigeant', function () {
  return {
    scope: {
      cfg: '='
    },
    templateUrl: 'app/directives/saisie/abstract.html',
    controller: function ($scope, Dirigeant, Dictionary) {

      $scope.dirigeant = {};

      if ($scope.cfg.id) {
        Dirigeant.get({id: $scope.cfg.id}, function (dirigeant) {
          $scope.dirigeant = dirigeant.fiche;
          $scope.formCfg = getFormCfg();
        });
      } else {
        $scope.formCfg = getFormCfg();
      }

      function cb (data, dbResult) {
        window.location.hash = '#/dirigeant/' + dbResult.id;
      };

      function getFormCfg() {
        return {
          id: $scope.cfg.id,
          type: 'dirigeant',
          cb: cb,
          inputs: [{
            name: 'nom',
            label: 'Nom',
            value: $scope.dirigeant.nom,
            type: 'text',
            placeholder: 'En majuscules',
            required: true
          }, {
            name: 'prenom',
            label: 'Prénom',
            value: $scope.dirigeant.prenom,
            type: 'text'
          }, {
            name: 'dateNaissance',
            label: 'Date de naissance',
            value: $scope.dirigeant.dateNaissance,
            type: 'date'
          }, {
            name: 'nationalite',
            label: 'Nationalité',
            value: $scope.dirigeant.nationalite,
            type: 'select',
            options: Dictionary.allNationalites(),
            required: true
          }, {
            name: 'villeNaissance',
            label: 'Ville de naissance',
            value: $scope.dirigeant.villeNaissance,
            type: 'text'
          }, {
            name: 'territoireNaissanceEtranger',
            label: 'Territoire de naissance (si étranger)',
            value: $scope.dirigeant.territoireNaissance,
            type: 'select',
            options: Dictionary.allNationalites()
          }, {
            name: 'territoireNaissanceFrancais',
            label: 'Territoire de naissance (si en France)',
            value: $scope.dirigeant.territoireNaissance,
            type: 'text',
            placeholder: 'Numéro de département'
          }, {
            name: 'dateDeces',
            label: 'Date de décès',
            value: $scope.dirigeant.dateDeces,
            type: 'date'
          }, {
            name: 'idJoueur',
            label: 'Id joueur',
            value: $scope.dirigeant.idJoueur,
            type: 'text'
          }]
        };
      };

    }
  };
});