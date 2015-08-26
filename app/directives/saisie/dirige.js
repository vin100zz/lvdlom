app.directive('lvdlomSaisieDirige', function () {
  return {
    scope: {
      cfg: '='
    },
    templateUrl: 'app/directives/saisie/common/abstract.html',
    controller: function ($scope, Joueur, Dictionary) {

      $scope.formCfg = getFormCfg();

      function cb (data, dbResult) {
        window.location.hash = '#/dirigeant/' + dbResult[0].id;
      };

      function getFormCfg() {
        return {
          id: $scope.cfg.id,
          type: 'dirige',
          cb: cb,
          inputs: [{
            name: 'idDirigeant',
            label: 'Dirigeant',
            type: 'select',
            options: Dictionary.dirigeants(),
            required: true
          }, {
            name: 'idFonction',
            label: 'Fonction',
            type: 'select',
            options: Dictionary.fonctions(),
            required: true
          }, {
            name: 'debut',
            label: 'Début',
            type: 'date',
            required: true
          }, {
            name: 'fin',
            label: 'Fin',
            type: 'date',
            required: true
          }]
        };
      }

    }
  };
});