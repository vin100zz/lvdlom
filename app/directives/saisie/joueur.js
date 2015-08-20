app.directive('lvdlomSaisieJoueur', function () {
  return {
    scope: {
      saison: '='
    },
    templateUrl: 'app/directives/saisie/joueur.html',
    controller: function ($scope) {
    
      $scope.cfg = {
        inputs: [{
          name: 'nom',
          label: 'Nom (en majuscules)',
          type: 'text',
          required: true
        }, {
          name: 'prenom',
          label: 'Prénom',
          type: 'text'
        }, {
          name: 'poste',
          label: 'Poste',
          type: 'select',
          options: [
            {value: 'GA', label: 'Gardien'},
            {value: 'DE', label: 'Défenseur'},
            {value: 'MI', label: 'Milieu'},
            {value: 'AV', label: 'Attaquant'}
          ],
          required: true
        }, {
          name: 'dateNaissance',
          label: 'Date de naissance',
          type: 'date'
        }, {
          name: 'villeNaissance',
          label: 'Ville de naissance',
          type: 'text'
        }, {
          name: 'territoireNaissanceEtranger',
          label: 'Territoire de naissance (si étranger)',
          type: 'text'
        }, {
          name: 'territoireNaissanceFrancais',
          label: 'Territoire de naissance (si français)',
          type: 'text',
          placeholder: 'numéro de département'
        }, {
          name: 'dateDeces',
          label: 'Date de décès',
          type: 'date'
        }, {
          name: 'nationalite',
          label: 'Nationalité',
          type: 'text'
        }, {
          name: 'auClub',
          label: 'Actuellement au club ?',
          type: 'checkbox'
        }]
      };

    }
  };
});