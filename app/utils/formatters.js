app.service('Formatter', function (Bom) {
  var _this = this;
  
  this.int = function (value) {
    return parseInt(value, 10) || 0;
  };
  
  this.diff = function (value) {
    var integer = _this.int(value);
    return (integer > 0 ? '+' : '') + integer;
  };
  
  this.nom = function (joueur) {
    var out = '<a href="#joueur/' + joueur.id + '">' + joueur.prenom + ' ' + joueur.nom + '</a>';
    if (joueur.auClub === "1" || joueur.auClub === "Y") {
      out += '<span class="icon-au-club"></span>';
    }
    return out;
  };
  
  this.poste = function (poste) {
    return '<span class="badge poste ' + poste + '">' + poste.substr(0,1) + '</span>';
  };
  
  this.flag = function (pays) {
    return '<div class="flag flag-' + pays + '">' + pays + '</div>';
  };
  
  this.date = function (date) {
    var d = date.substr(8, 2);
    var m = date.substr(5, 2);
    var y = date.substr(0, 4);
    return d + '.' + m + '.' + y;
  };
  
  this.dateNaissance = function (dateNaissance) {
    if (dateNaissance) {
      var dNaiss = dateNaissance.substr(8, 2);
      var mNaiss = dateNaissance.substr(5, 2);
      var yNaiss = dateNaissance.substr(0, 4);
      var date = dNaiss + '.' + mNaiss + '.' + yNaiss;
      
      var now = new Date();
      var dNow = now.getDate();
      var mNow = now.getMonth();
      var yNow = now.getFullYear();
      
      var dNaissInt = parseInt(dNaiss, 10);
      var mNaissInt = parseInt(mNaiss, 10) - 1;
      var yNaissInt = parseInt(yNaiss, 10);
      
      var age = yNow - yNaissInt - 1;
      if (mNow > mNaissInt || (mNow === mNaissInt && dNow >= dNaissInt)) {
        ++age;
      }
      
      return '<span>' + date + '</span><span class="remark">' + age + ' ans</span>';
    }
    return '';
  };
  
  this.lieuNaissance = function (joueur) {
    return '<span>' + joueur.villeNaissance + '</span><span class="remark">' + joueur.territoireNaissance + '</span>';
  };
  
  this.competition = function (item) {
    return _this.sousTypeCompetition(item.sousTypeCompetition) + item.competition;
  };
  
  this.sousTypeCompetition = function (sousTypeCompetition) {
    return '<span class="badge competition ' + sousTypeCompetition + '">' + sousTypeCompetition + '</span>';
  };
  
  this.competitionNiveau = function (match) {
    var badge = _this.sousTypeCompetition(match.sousTypeCompetition);
    var niveau = match.niveau;
    return badge + niveau;
  };
  
  this.titres = function (titres) {
    return titres.split(',').map(_this.sousTypeCompetition).join('');
  };
  
  // bars
  this._bar = function (width, color) {
    return '<div style="width: ' + width + '%; background-color: ' + color + ';"></div>';;
  };
  
  this._bilan = function (max, data) {
    var out = '';
    data.forEach(function (item) {
      var value = parseInt(item.value, 10) || 0;
      var width = Math.min(value / max * 100, 100);
      out += _this._bar(width, item.color);
    });
    return '<div class="table-bilan">' + out + '</div>';
  };
  
  this.bilanMatchesButs = function (max, joueur) {
    return _this._bilan(max.value, [{value: joueur.nbMatches, color: '#3498db'}, {value: joueur.nbButs, color: '#ff9000'}]);
  };
  
  this.bilanMatchesVictoires = function (max, bilan) {
    return _this._bilan(max.value, [{value: bilan.nbMatches, color: '#3498db'}, {value: bilan.nbVictoires, color: '#ff9000'}]);
  };
  
  this.lieu = function (lieu) {
    var domicile = Bom.domicile(lieu) ? 'D' : 'E';
    return '<span class="icon-lieu ' + domicile + '"></span>' + lieu;
  };
  
  this.club = function (match) {
    return '<div class="club"><div class="icon club-' + match.idAdv + '"></div></div>' + match.nomAdv;
  };
  
  this.$Score = {
    table: 'table',
    big: 'big'
  };
  this.score = function (formatting, match) {
    var butsOM = parseInt(match.butsOM, 10) || 0;
    var butsAdv = parseInt(match.butsAdv, 10) || 0;
    var tabOM = parseInt(match.tabOM, 10) || 0;
    var tabAdv = parseInt(match.tabAdv, 10) || 0;
    var domicile = Bom.domicile(match.lieu);
    var resultat = Bom.resultat(match);
    var out = '';
    
    if (formatting === _this.$Score.table) {
      out = '<span class="icon-resultat ' + resultat + '"></span>';
      out += '<a href="#match/' + match.id + '">' + butsOM + '-' + butsAdv + '</a>';
    } else if (formatting === _this.$Score.big) {
      var left = domicile ? match.butsOM : match.butsAdv;
      var right = domicile ? match.butsAdv : match.butsOM;
      out = left + "-" + right;
    }
    
    if (tabOM || tabAdv) {
      out += '<span class="remark">' + tabOM + '-' + tabAdv + ' tab</span>';
    } else if (match.rqScore) {
      out += '<span class="remark">' + match.rqScore + '</span>';
    }
    return out;
  };
  
  this.nomOm = function (saison) {
    return saison === "1943-44" ? "MARSEILLE-PROVENCE" : "OM";
  };
  
  this.match = function (match) {
    var left = Bom.domicile(match.lieu) ? _this.nomOm(match.saison) : match.nomAdv;
    var right = Bom.domicile(match.lieu) ? match.nomAdv : _this.nomOm(match.saison);
    return left + "-" + right;
  };
});

app.filter('reverse', function () {
  return function (items) {
    return (items || []).slice().reverse();
  };
});

app.filter('format', function (Formatter) {
  return function (item, name) {
    return Formatter[name](item);
  };
});

app.filter('score', function (Formatter) {
  return function (match) {
    return Formatter.score(Formatter.$Score.big, match);
  };
});


