app.service('Filter', function (Dictionary) {
  
  // utils
  this.toParams = function (filters) {
    var filterParams = {};
    filters.forEach(function (filter) {
      if (filter.active) {
        filterParams[filter.criterion] = filter.value;
      }
    });
    return filterParams;
  };
  
  this.updated = function (newValue, oldValue) {
    var newFilterParams = this.toParams(newValue);
    var oldFilterParams = this.toParams(oldValue);
    if (!angular.equals(newFilterParams, oldFilterParams)) {
      return newFilterParams;
    }
    return null;
  };
  
  // filters
  var periods = [];
  for (var i = 2010; i >= 1900; i = i-10) {
    periods.push({key: i, label: 'Années ' + i});
  }
  this.periode = {
    criterion: 'periode',
    label: 'Période',
    options: [{key: 'AVG', label: 'Avant-Guerre'}, {key: 'APG', label: 'Après-Guerre'}].concat(periods),
    value: 'APG',
    active: false
  };
  
  this.saison = {
    criterion: 'saison',
    label: 'Saison',
    options: Dictionary.saisons(),
    value: Dictionary.saisons()[0].key,
    active: true
  };
  
  this.jyEtais = {
    criterion: 'jyEtais',
    label: 'J\'y Étais',
    options: [{key: 'P', label: 'Oui'}, {key: 'V', label: 'Avec V'}],
    value: 'P'
  };
  
  this.lieu = {
    criterion: 'lieu',
    label: 'Lieu',
    options: [{key: 'DOM', label: 'Domicile'}, {key: 'EXT', label: 'Extérieur'}],
    value: 'DOM'
  };
  
  this.competition = {
    criterion: 'competition',
    label: 'Compétition',
    options: [{key: 'CH', label: 'Championnat'}, {key: 'CE', label: 'Coupe d\'Europe'}, {key: 'CN', label: 'Coupe Nationale'}],
    value: 'CH'
  };
  
  this.adversaire = {
    criterion: 'adversaire',
    label: 'Adversaire',
    options: Dictionary.adversaires(),
    value: Dictionary.adversaires()[0].key,
  };
  
  this.poste = {
    criterion: 'poste',
    label: 'Poste',
    options: [{key: 'GA', label: 'Gardien'}, {key: 'DE', label: 'Défenseur'}, {key: 'MI', label: 'Milieu'}, {key: 'AV', label: 'Attaquant'}],
    value: 'GA',
    active: false
  };

  this.nationalite = {
    criterion: 'nationalite',
    label: 'Nationalité',
    options: Dictionary.nationalites(),
    value: 'FRA',
    active: false
  };
  
  this.lieuNaissance = {
    criterion: 'lieuNaissance',
    label: 'Lieu de naissance',
    options: [{key: 'MRS', label: 'Marseille'}, {key: '13', label: '13'}],
    value: 'MRS',
    active: false
  };
  
  this.formeAuClub = {
    criterion: 'formeAuClub',
    label: 'Formé au club',
    options: [{key: '1', label: 'Oui'}, {key: '0', label: 'Non'}],
    value: '1',
    active: false
  };
  
  this.auClub = {
    criterion: 'auClub',
    label: 'Au club',
    options: [{key: '1', label: 'Oui'}, {key: '0', label: 'Non'}],
    value: '1',
    active: true
  };
  
  this.fonction = {
    criterion: 'fonction',
    label: 'Fonction',
    options: Dictionary.fonctions(),
    value: Dictionary.fonctions()[0].key,
    active: false
  };
  
});