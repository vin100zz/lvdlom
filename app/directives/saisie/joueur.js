app.directive('lvdlomSaisieJoueur', function () {
  return {
    scope: {
      cfg: '='
    },
    templateUrl: 'app/directives/saisie/common/abstract.html',
    controller: function ($scope, Joueur, Dictionary) {

      $scope.joueur = {};

      if ($scope.cfg.id) {
        Joueur.get({id: $scope.cfg.id}, function (joueur) {
          $scope.joueur = joueur.fiche;
          $scope.formCfg = getFormCfg();
        });
      } else {
        $scope.formCfg = getFormCfg();
      }

      function cb (data, dbResult) {
        console.log(arguments);
        window.location.hash = '#/joueur/' + dbResult[0].id;
      };

      function getFormCfg() {
        return {
          id: $scope.cfg.id,
          type: 'joueur',
          cb: cb,
          inputs: [{
            name: 'nom',
            label: 'Nom',
            value: $scope.joueur.nom,
            type: 'text',
            placeholder: 'En majuscules',
            required: true
          }, {
            name: 'prenom',
            label: 'Prénom',
            value: $scope.joueur.prenom,
            type: 'text'
          }, {
            name: 'poste',
            label: 'Poste',
            value: $scope.joueur.poste,
            type: 'select',
            options: Dictionary.postes(),
            required: true
          }, {
            name: 'dateNaissance',
            label: 'Date de naissance',
            value: $scope.joueur.dateNaissance,
            type: 'date'
          }, {
            name: 'nationalite',
            label: 'Nationalité',
            value: $scope.joueur.nationalite,
            type: 'select',
            options: Dictionary.allNationalites(),
            required: true
          }, {
            name: 'villeNaissance',
            label: 'Ville de naissance',
            value: $scope.joueur.villeNaissance,
            type: 'text'
          }, {
            name: 'territoireNaissanceEtranger',
            label: 'Territoire de naissance (si étranger)',
            value: $scope.joueur.territoireNaissance,
            type: 'select',
            options: Dictionary.allNationalites()
          }, {
            name: 'territoireNaissanceFrancais',
            label: 'Territoire de naissance (si en France)',
            value: $scope.joueur.territoireNaissance,
            type: 'text',
            placeholder: 'Numéro de département'
          }, {
            name: 'dateDeces',
            label: 'Date de décès',
            value: $scope.joueur.dateDeces,
            type: 'date'
          }, {
            name: 'auClub',
            label: 'Actuellement au club ?',
            value: $scope.joueur.auClub,
            type: 'checkbox'
          }]
        };
      };

    }
  };
});