app.directive('lvdlomSaisieDocument', function () {
  return {
    scope: {
      cfg: '='
    },
    templateUrl: 'app/directives/saisie/common/abstract.html',
    controller: function ($scope, Joueur, Dictionary) {

      $scope.formCfg = getFormCfg();

      function cb (data, dbResult) {
        //window.location.hash = '#/dirigeant/' + data.idDirigeant;
      };

      function getFormCfg() {
        return {
          id: $scope.cfg.id,
          type: 'document',
          cb: cb,
          inputs: [{
            name: 'nomFicher',
            label: 'Nom',
            type: 'text',
            required: true
          }, {
            name: 'date',
            label: 'Date',
            type: 'date'
          }, {
            name: 'source',
            label: 'Source',
            type: 'select',
            options: Dictionary.sources()
          }, {
            name: 'legende',
            label: 'Legende',
            type: 'text'
          }, {
            name: 'documents',
            label: 'Documents',
            type: 'documents'
          }]
        };
      };

    }
  };
});