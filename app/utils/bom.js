app.service('Bom', function() {
 
  this.$Resultat = {
    victoire: 'V',
    nul: 'N',
    defaite: 'D'
  };
  
  this.resultat = function (match) {
    if (!match) {return '';}
    
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
    return (lieu === 'Huveaune' || lieu === 'Stade Vél\'');
  };
});