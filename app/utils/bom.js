app.service('Bom', function () {

  this.$Resultat = {
    victoire: 'V',
    nul: 'N',
    defaite: 'D'
  };

  this.resultat = function (match) {
    if (!match) {
      return '';
    }

    var butsOM = parseInt(match.butsOM, 10) || 0;
    var butsAdv = parseInt(match.butsAdv, 10) || 0;
    var tabOM = parseInt(match.tabOM, 10) || 0;
    var tabAdv = parseInt(match.tabAdv, 10) || 0;
    if (butsOM > butsAdv || (butsOM === butsAdv && tabOM > tabAdv)) {
      return this.$Resultat.victoire;
    }
    if (butsOM < butsAdv || (butsOM === butsAdv && tabOM < tabAdv)) {
      return this.$Resultat.defaite;
    }
    return this.$Resultat.nul;
  };

  this.domicile = function (lieu) {
    return (lieu === 'Huveaune' || lieu === 'Stade Vél\'' || lieu === 'Orange Vélodrome');
  };

  this.poste = function (poste) {
    return {
      'GA': 'Gardien',
      'DE': 'Défenseur',
      'MI': 'Milieu',
      'AV': 'Attaquant'
    }[poste];
  };

  this.ageSince = function (date) {
    return Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24 * 365));
  };

  this.age = function (days, showMonth) {
    days = parseInt(days, 10);
    var years = Math.floor(days / 365);
    var months = Math.floor((days - years * 365) / 30);
    return years + ' ans' + (showMonth && months > 0 ? ' ' + months + ' mois' : '');
  };

});