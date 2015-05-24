app.service('Sorter', function() {
  this.int = function (nb) {
    return parseInt(nb, 10) || 0;
  };
  
  this.nom = function (joueur) {
    return joueur.nom + joueur.prenom;
  };
  
  this.poste = function (poste) {
    return ['GA', 'DE', 'MI', 'AV'].indexOf(poste);
  };
  
  this.lieuNaissance = function (joueur) {
    return joueur.villeNaissance;
  };
  
  this.periode = function (periode) {
    var begin = periode.substr(0, 4);
    var end = periode.substr(5, 4);
    return begin * 1000000 + end;
  };
  
  this.duration = function (periode) {
    var begin = periode.substr(0, 4);
    var end = periode.substr(5, 4);
    var duration = end - begin + 1;
    return duration * 1000000 + begin;
  };
  
  this.bilan = function (bilan) {
    return parseInt(bilan.nbMatches, 10) || 0;
  };
  
  this.competition = function (item) {
    return item.typeCompetition + item.sousTypeCompetition + item.competition;
  };
  
  this.competitionNiveau = function (match) {
    return match.sousTypeCompetition + match.competition + match.niveau;
  };
  
  this.club = function (match) {
    return match.nomAdv;
  };
  
  this.score = function (match) {
    var butsOM = parseInt(match.butsOM, 10) || 0;
    var butsAdv = parseInt(match.butsAdv, 10) || 0;
    return (butsOM - butsAdv) * 1000 + butsOM;
  };

});