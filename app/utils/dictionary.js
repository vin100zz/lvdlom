app.service('Dictionary', function ($http, Countries) {
  
  var dictionary = {};
  
  this.init = $http.get('services/dictionary.php')
  .success(function (data, status, headers, config) {
    dictionary = data;
    runInitCb();
  });

  // cb
  var initCb = [];

  this.whenReady = function (cb) {
    initCb.push(cb);
  };

  function runInitCb () {
    initCb.forEach(function (cb) {
      cb();
    });
  }

  // data
  this.postes = function () {
    return [
      {key: 'GA', label: 'Gardien'},
      {key: 'DE', label: 'Défenseur'},
      {key: 'MI', label: 'Milieu'},
      {key: 'AV', label: 'Attaquant'}
    ];
  };

  this.countries = function () {
    return Countries.all();
  };
  
  this.saisons = function () {
    return dictionary.saisons;
  };
  
  this.adversaires = function () {
    return dictionary.adversaires;
  };
  
  this.fonctions = function () {
    return dictionary.fonctions;
  };
  
  this.joueurs = function () {
    return dictionary.joueurs;
  };

  this.joueursAuClub = function () {
    return dictionary.joueursAuClub;
  };
  
  this.dirigeants = function () {
    return dictionary.dirigeants;
  };
  
  this.matches = function () {
    return dictionary.matches;
  };

  this.sources = function () {
    return dictionary.sources;
  };

  this.lieux = function () {
    return dictionary.lieux;
  };

  this.competitions = function () {
    return dictionary.competitions;
  };

  this.niveaux = function () {
    return dictionary.niveaux;
  };

  this.jyEtais = function () {
    return dictionary.jyEtais;
  };
 

});
