app.directive('lvdlomSaisieDocument', function () {
  return {
    scope: {
      cfg: '='
    },
    templateUrl: 'app/directives/saisie/common/abstract.html',
    controller: function ($scope, Joueur, Dictionary) {

      $scope.formCfg = getFormCfg();

      function cb (data, dbResult) {
        data.associations.forEach(function (association, index) {
          var linkObject = '';
          if (association.type === 'M') {
            linkObject = 'match';
          } else if (association.type === 'J') {
            linkObject = 'joueur';
          } else if (association.type === 'D') {
            linkObject = 'dirigeant';
          } else if (association.type === 'S') {
            linkObject = 'saison';
          }
          var link = '#/' + linkObject + '/' + association.id;
          if (index === 0) {
            window.location.hash = link;
          } else {
            window.open(link, '_blank');
          }
        });
      };

      function getFormCfg() {
        return {
          id: $scope.cfg.id,
          type: 'document',
          cb: cb,
          inputs: [{
            name: 'file',
            label: 'Nom du fichier',
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
            name: 'associations',
            label: 'Associations',
            type: 'associations'
          }]
        };
      };

    }
  };
});