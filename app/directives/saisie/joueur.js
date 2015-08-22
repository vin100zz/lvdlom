app.directive('lvdlomSaisieJoueur', function () {
  return {
    scope: {
      cfg: '='
    },
    templateUrl: 'app/directives/saisie/joueur.html',
    controller: function ($scope, Joueur, Dictionary) {

      if ($scope.cfg.id) {

        $scope.cfg = Joueur.get({id: $scope.cfg.id}, function (joueur) {

          $scope.formCfg = {
            id: $scope.cfg.id,
            inputs: [{
              name: 'nom',
              label: 'Nom',
              value: joueur.fiche.nom,
              type: 'text',
              placeholder: 'En majuscules',
              required: true
            }, {
              name: 'prenom',
              label: 'Prénom',
              value: joueur.fiche.prenom,
              type: 'text'
            }, {
              name: 'poste',
              label: 'Poste',
              value: joueur.fiche.poste,
              type: 'select',
              options: Dictionary.postes(),
              required: true
            }, {
              name: 'dateNaissance',
              label: 'Date de naissance',
              value: joueur.fiche.dateNaissance,
              type: 'date'
            }, {
              name: 'nationalite',
              label: 'Nationalité',
              value: joueur.fiche.nationalite,
              type: 'select',
              options: Dictionary.allNationalites(),
              required: true
            }, {
              name: 'villeNaissance',
              label: 'Ville de naissance',
              value: joueur.fiche.villeNaissance,
              type: 'text'
            }, {
              name: 'territoireNaissanceEtranger',
              label: 'Territoire de naissance (si étranger)',
              value: joueur.fiche.territoireNaissance,
              type: 'select',
              options: Dictionary.allNationalites()
            }, {
              name: 'territoireNaissanceFrancais',
              label: 'Territoire de naissance (si en France)',
              value: joueur.fiche.territoireNaissance,
              type: 'text',
              placeholder: 'Numéro de département'
            }, {
              name: 'dateDeces',
              label: 'Date de décès',
              value: joueur.fiche.dateDeces,
              type: 'date'
            }, {
              name: 'auClub',
              label: 'Actuellement au club ?',
              value: joueur.fiche.auClub,
              type: 'checkbox'
            }]
          };
        });
      }
    }
  };
});