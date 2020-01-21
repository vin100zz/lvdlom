app.service('Formatter', function (Bom, Dictionary, $filter, Countries) {
  var _this = this;
  
  var removeDuplicates = function (result, item, index) {
    if (result.indexOf(item) === -1) {
      result.push(item);
    }
    return result;
  };
  
  this.int = function (value) {
    return parseInt(value, 10) || 0;
  };
  
  this.diff = function (value) {
    var integer = _this.int(value);
    return (integer > 0 ? '+' : '') + integer;
  };
  
  this._nom = function (personne, link) {
    var prenom = personne.prenom.trim();
    return '<a href="#' + link + '/' + personne.id + '">' + (prenom ? prenom + ' ' : '') + personne.nom + '</a>';
  };
  
  this.nomJoueur = function (joueur) {
    var out = _this._nom(joueur, 'joueur');
    if (joueur.auClub === "1" || joueur.auClub === "Y") {
      out += '<span class="icon-au-club"></span>';
    }
    return out;
  };

  this.nomJoueurOnTwoLines = function (joueur) {
    var prenom = joueur.prenom.trim();
    return '<a href="#joueur/' + joueur.id + '">' + (prenom ? prenom + ' ' : '') + '<br/>' + joueur.nom + '</a>';
  };
  
  this.nomDirigeant = function (dirigeant) {
    return _this._nom(dirigeant, 'dirigeant');
  };  
  
  this.poste = function (poste) {
    return '<span class="g-badge poste ' + poste + '">' + poste.substr(0,1) + '</span>';
  };
  
  this.fonction = function (fonction) {
    return '<span class="g-badge fonction ' + fonction.substr(0,1) + '">' + fonction.substr(0,1) + '</span>';
  };
  
  this.fonctions = function (fonctions) {
    return fonctions.split(',').reduce(removeDuplicates, []).map(_this.fonction).join(' ');
  };
  
  this.flag = function (country) {
    return '<div class="icon-flag flag-' + country + '">' + country + '</div>';
  };

  this.flagFullNat = function (country) {
    return '<div class="icon-flag flag-' + country + '">' + Countries.getLabel(country) + '</div>';
  };
  
  this.date = function (date) {
    if (date && date.length === 10) {
      return $filter('date')(date, 'dd.MM.yyyy');
    }
    return '';
  };
  
  this.dateLong = function (date) {
    if (date && date.length === 10) {
      var d = $filter('date')(date, 'd MMMM yyyy');
      if (d && d.indexOf('1 ') === 0) {
        d = '1er ' + d.substr(2);
      }
      return d;
    }
    return '';
  };
  
  this.dateNaissance = function (dateNaissance) {
    if (dateNaissance && dateNaissance.length === 10) {
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
      
      return '<span>' + date + '</span><span class="g-remark">' + age + ' ans</span>';
    }
    return '';
  };
  
  this.lieuNaissance = function (joueur) {
    return '<span>' + joueur.villeNaissance + '</span><span class="g-remark">' + joueur.territoireNaissance + '</span>';
  };
  
  this.competition = function (item) {
    return _this.sousTypeCompetition(item.sousTypeCompetition) + item.competition;
  };
  
  this.sousTypeCompetition = function (sousTypeCompetition) {
    return '<span class="g-badge competition ' + sousTypeCompetition + '">' + sousTypeCompetition + '</span>';
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
    return '<div style="width: ' + width + '%; background-color: ' + color + ';"></div>';
  };
  
  this._bilan = function (max, data, nbPerDisplay) {
    var out = '';
    data.forEach(function (item) {
      var value = parseInt(item.value, 10) || 0;
      var width = Math.min(value / max * 100, 100);
      out += _this._bar(width, item.color);
    });
    var nbPer = (parseInt(data[1].value, 10) || 0) / (parseInt(data[0].value, 10) || Infinity);
    nbPer = Math.floor(nbPer*100);
    nbPer = (nbPerDisplay === 'pc' ? nbPer + '%' : nbPer/100);
    return '<div class="g-table-bilan"><div class="g-remark">' + nbPer + '</div><div>' + out + '</div></div>';
  };
  
  this.bilanMatchesButs = function (max, joueur) {
    return _this._bilan(max.value, [{value: joueur.nbMatches, color: '#3498db'}, {value: joueur.nbButs, color: '#ff9000'}]);
  };
  
  this.bilanMatchesVictoires = function (max, bilan) {
    return _this._bilan(max.value, [{value: bilan.nbMatches, color: '#3498db'}, {value: bilan.nbVictoires, color: '#ff9000'}], 'pc');
  };
  
  this.lieu = function (lieu) {
    var domicile = Bom.domicile(lieu) ? 'D' : 'E';
    return '<span class="icon-lieu ' + domicile + '"></span>' + lieu;
  };

  this._club  = function (match, name) {
    return '<div class="icon-club-wrapper"><div class="icon-club club-' + match.idAdv + '"></div></div>' + name;
  };
  
  this.club = function (match) {
    return _this._club(match, match.nomAdv);
  };

  this.clubLink = function (match) {
    return _this._club(match, '<a href="#/matches/adversaire/' + match.idAdv + '">' + match.nomAdv + '</a>');
  };
  
  this.$Score = {
    table: 'table',
    big: 'big',
    complete: 'complete'
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
      
      if (tabOM || tabAdv) {
        out += '<span class="g-remark">' + tabOM + '-' + tabAdv + ' tab</span>';
      } else if (match.rqScore) {
        out += '<span class="g-remark">' + match.rqScore + '</span>';
      }
    } else if (formatting === _this.$Score.big || formatting === _this.$Score.complete) {
      var left = domicile ? match.butsOM : match.butsAdv;
      var right = domicile ? match.butsAdv : match.butsOM;
      out = left + '-' + right;

      if (formatting === _this.$Score.complete && (tabOM || tabAdv)) {
        left = domicile ? match.tabOM : match.tabAdv;
        right = domicile ? match.tabAdv : match.tabOM;
        out += ' (' + left + '-' + right + ' tab)';
      }
    }
    return out;
  };
  
  this.nomOm = function (saison) {
    return saison === '1943-44' ? 'MARSEILLE-PROVENCE' : 'OM';
  };
  
  this.match = function (match) {
    var left = Bom.domicile(match.lieu) ? _this.nomOm(match.saison) : match.nomAdv;
    var right = Bom.domicile(match.lieu) ? match.nomAdv : _this.nomOm(match.saison);
    return left + '-' + right;
  };

  this.matchLink = function (match) {
    return '<a href="#/match/' + match.id + '">' + _this.match(match) + '</a>';
  };
  
  this.matchTitle = function (match) {
    var left = Bom.domicile(match.fiche.lieu) ? _this.nomOm(match.fiche.saison) : match.adversaire.nom;
    var right = Bom.domicile(match.fiche.lieu) ? match.adversaire.nom : _this.nomOm(match.fiche.saison);
    return left + ' - ' + right;
  };
  
  this.carton = function (carton) {
    if (carton) {
      return '<div class="icon-carton ' + carton[0] + '"></div>' + (carton.length > 1 ? '<span class="g-remark">' + carton.substr(1) + '\'</span>' : '');
    }
    return '';
  };
  
  this.butsPerJoueur = function (idJoueur, buteurs) {
    var nbButs = (buteurs || []).reduce(function (previous, buteur) {
      return previous + (buteur.id === idJoueur ? 1 : 0);
    }, 0);
    return _this.buts(nbButs);
  };

  this.buts = function (nbButs) {
    var res = '';
    for (var i=0; i<nbButs; ++i) {
      res += '<div class="icon-but"></div>';
    }
    return res;
  };
  
  this.saison = function (saison, prefix) {
    return '<a href="#/saison/' + saison + '">' + ((prefix ? prefix + ' ' : '') + saison)+ '</a>';
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


