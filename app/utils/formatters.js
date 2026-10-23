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
    return '<a href="#' + link + '/' + personne.id + '" class="g-nom">' + (prenom ? prenom + ' ' : '') + '<b>' + personne.nom + '</b></a>';
  };

  this.nomJoueur = function (joueur) {
    var out = _this._nom(joueur, 'joueur');
    if (joueur.auClub === "1" || joueur.auClub === "Y") {
      out += '<span class="icon-au-club"></span>';
    }
    return out;
  };

  this.nomJoueurOrDirigeantOnTwoLines = function (personne) {
    var link = personne.titre ? 'dirigeant' : 'joueur';
    var prenom = personne.prenom.trim();
    return '<a href="#' + link + '/' + personne.id + '">' + (prenom ? prenom + ' ' : '') + '<br/>' + personne.nom + '</a>';
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
  
  // dates courtes, sans point après le mois : « 10 avr 2026 »
  var MOIS = ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];

  // quelques fiches sont saisies en jj/mm/aaaa : on les ramène à aaaa-mm-jj
  var isoDate = function (date) {
    var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date || '');
    return m ? m[3] + '-' + m[2] + '-' + m[1] : date;
  };
  this.isoDate = isoDate;

  this.date = function (date) {
    date = isoDate(date);
    if (date && date.length === 10) {
      var jour = parseInt(date.substr(8, 2), 10);
      return (jour === 1 ? '1er' : jour) + ' ' + MOIS[parseInt(date.substr(5, 2), 10) - 1] + ' ' + date.substr(0, 4);
    }
    return '';
  };

  // date avec le jour en toutes lettres : « Dimanche 1er mars 2026 »
  var JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  var MOIS_LONGS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  var dateLongue = function (date, avecJour) {
    date = isoDate(date);
    if (date && date.length === 10) {
      var y = parseInt(date.substr(0, 4), 10), m = parseInt(date.substr(5, 2), 10), d = parseInt(date.substr(8, 2), 10);
      var jour = avecJour && m && d ? JOURS[new Date(y, m - 1, d).getDay()] + ' ' : '';
      return jour + (d === 1 ? '1er' : d) + ' ' + (MOIS_LONGS[m - 1] || '') + ' ' + y;
    }
    return '';
  };

  this.dateJour = function (date) {
    return dateLongue(date, true);
  };

  // date longue sans le jour : « 1er mars 2026 »
  this.dateLongue = function (date) {
    return dateLongue(date, false);
  };

  // âge en années révolues, à aujourd'hui ou à une date donnée
  this.age = function (dateNaissance, dateRef) {
    dateNaissance = isoDate(dateNaissance);
    if (!dateNaissance || dateNaissance.length !== 10) {
      return null;
    }
    var ref = dateRef ? isoDate(dateRef) : null;
    var now = ref && ref.length === 10 ? new Date(parseInt(ref.substr(0, 4), 10), parseInt(ref.substr(5, 2), 10) - 1, parseInt(ref.substr(8, 2), 10)) : new Date();
    var y = parseInt(dateNaissance.substr(0, 4), 10), m = parseInt(dateNaissance.substr(5, 2), 10) - 1, d = parseInt(dateNaissance.substr(8, 2), 10);
    var age = now.getFullYear() - y - 1;
    if (now.getMonth() > m || (now.getMonth() === m && now.getDate() >= d)) {
      ++age;
    }
    return age;
  };

  this.ans = function (age) {
    return age === null || age === undefined ? '' : age + (age > 1 ? ' ans' : ' an');
  };

  // phrase dont les mots de liaison sont affichés en plus fin : phrase(['né le', '3 mars 1990'], ['à', 'Lyon'])
  this.phrase = function () {
    var mots = [];
    Array.prototype.forEach.call(arguments, function (groupe) {
      groupe.forEach(function (texte, index) {
        if (texte) {
          mots.push({texte: texte, liaison: index % 2 === 0});
        }
      });
    });
    return mots;
  };

  // période couverte par des saisons : « 2024 – 2026 »
  this.periodeSaisons = function (saisons) {
    var annees = (saisons || []).filter(function (s) {
      return /^\d{4}-\d{2}$/.test(s);
    }).map(function (s) {
      return parseInt(s.substr(0, 4), 10);
    }).sort();
    if (!annees.length) {
      return '';
    }
    var debut = annees[0], fin = annees[annees.length - 1] + 1;
    return debut + ' – ' + fin;
  };

  // « 24ème journée » → « 24e journée », « 1ère » → « 1re »
  this.niveauLong = function (niveau) {
    return (niveau || '').replace(/(\d+)\s*ème/g, '$1e').replace(/(\d+)\s*ère/g, '$1re');
  };

  // séparateur des milliers : « 66 225 »
  this.milliers = function (nombre) {
    return String(parseInt(nombre, 10) || 0).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
  };

  // libellés courts : « 1ère journée » → J1, « Phase de ligue, 4ème journée » → Ligue J4, « 32ème de finale » → 1/32
  this.niveauCourt = function (niveau) {
    var s = (niveau || '').trim(), suf = '', ligue = false, m, r;
    if (!s) {
      return '';
    }
    if ((m = s.match(/\s*\(([^)]*)\)$/))) { suf = ' (' + m[1] + ')'; s = s.slice(0, m.index); }
    if ((m = s.match(/\s+(aller|retour)$/i))) { suf = ' ' + m[1].toLowerCase() + suf; s = s.slice(0, m.index); }
    if ((m = s.match(/\s+en retard$/i))) { suf = ' (retard)' + suf; s = s.slice(0, m.index); }
    if (/^phase de ligue,\s*/i.test(s)) { ligue = true; s = s.replace(/^phase de ligue,\s*/i, ''); }
    if ((m = s.match(/^(\d+)\s*(?:re|ère|ème|er|e)?(?:\s+journée)?$/i))) { r = 'J' + m[1]; }
    else if ((m = s.match(/^(\d+)\s*(?:ème|e)\s+de finale$/i))) { r = '1/' + m[1]; }
    else if (/^quarts? de finale$/i.test(s)) { r = '1/4'; }
    else if (/^demi-finales?$/i.test(s)) { r = '1/2'; }
    else if (/^finale$/i.test(s)) { r = 'Finale'; }
    else if ((m = s.match(/^(\d+)\s*(?:re|ère|ème|er|e)\s+tour(\s+préliminaire)?$/i))) { r = 'T' + m[1] + (m[2] ? ' prélim.' : ''); }
    else { r = s; }
    return (ligue ? 'Ligue ' : '') + r + suf;
  };

  // J'y étais : badge or puis une pastille bleue par personne (« J'y étais + E + V ! »)
  this.jyEtais = function (jyEtais) {
    if (!jyEtais) {
      return '';
    }
    var avec = jyEtais.replace(/^J'y étais/i, '').replace(/!\s*$/, '').split('+').map(function (t) {
      return t.trim();
    }).filter(function (t) {
      return t;
    }).map(function (t) {
      return '<span class="avec" title="Avec ' + t + '">' + t + '</span>';
    });
    return '<span class="g-jy"><span class="moi">J\'y étais</span>' + avec.join('') + '</span>';
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
    dateNaissance = isoDate(dateNaissance);
    if (dateNaissance && dateNaissance.length === 10) {
      var dNaiss = dateNaissance.substr(8, 2);
      var mNaiss = dateNaissance.substr(5, 2);
      var yNaiss = dateNaissance.substr(0, 4);
      
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
      
      return '<span>' + _this.date(dateNaissance) + '</span><span class="g-remark">· ' + age + (age > 1 ? ' ans' : ' an') + '</span>';
    }
    return '';
  };
  
  this.lieuNaissance = function (joueur) {
    return '<span>' + (joueur.villeNaissance || '—') + '</span>' + (joueur.territoireNaissance ? '<span class="g-remark">(' + joueur.territoireNaissance + ')</span>' : '');
  };
  
  this.competition = function (item) {
    return _this.sousTypeCompetition(item.sousTypeCompetition) + item.competition;
  };
  
  this.sousTypeCompetition = function (sousTypeCompetition) {
    sousTypeCompetition = (sousTypeCompetition || '').trim();
    return '<span class="g-badge competition ' + sousTypeCompetition + '">' + sousTypeCompetition + '</span>';
  };
  
  this.competitionNiveau = function (match) {
    var badge = _this.sousTypeCompetition(match.sousTypeCompetition);
    var titre = (match.competition || '') + (match.niveau ? ' · ' + match.niveau : '');
    return '<span title="' + titre.replace(/"/g, '&quot;') + '" style="display: inline-flex; align-items: center">' + badge +
      '<span class="g-niveau">' + _this.niveauCourt(match.niveau) + '</span></span>';
  };
  
  // un badge par compétition, suivi du nombre de titres quand il y en a plusieurs : « CF ×3 »
  this.titres = function (titres) {
    var liste = (titres || '').split(',').map(function (titre) {
      return titre.trim();
    }).filter(function (titre) {
      return titre;
    });
    return '<span class="g-titres">' + liste.reduce(removeDuplicates, []).map(function (competition) {
      var nb = liste.filter(function (titre) {
        return titre === competition;
      }).length;
      return '<span class="g-titre" title="' + nb + ' titre' + (nb > 1 ? 's' : '') + '">' + _this.sousTypeCompetition(competition) +
        (nb > 1 ? '<span class="nb">×' + nb + '</span>' : '') + '</span>';
    }).join('') + '</span>';
  };
  
  // bilans dans les tableaux (charte · graphiques)
  // buts par match : la valeur, puis une barre bleue sur une piste grise
  this.bilanMatchesButs = function (max, joueur) {
    var matches = _this.int(joueur.nbMatches), buts = _this.int(joueur.nbButs);
    var ratio = matches ? buts / matches : 0;
    var largeur = Math.min(ratio / 0.8 * 100, 100);
    return '<span class="g-ratio" title="' + buts + ' buts en ' + matches + ' matches"><span class="valeur">' + ratio.toFixed(2).replace('.', ',') + '</span>' +
      '<span class="piste"><span style="width: ' + largeur.toFixed(0) + '%"></span></span></span>';
  };

  // victoires, nuls, défaites : une barre empilée aux couleurs du score, puis le pourcentage de victoires
  this.bilanMatchesVictoires = function (max, bilan) {
    var matches = _this.int(bilan.nbMatches), v = _this.int(bilan.nbVictoires), n = _this.int(bilan.nbNuls);
    var d = bilan.nbDefaites !== undefined && bilan.nbDefaites !== '' ? _this.int(bilan.nbDefaites) : Math.max(matches - v - n, 0);
    var total = v + n + d;
    var segment = function (valeur, classe, libelle) {
      if (!valeur) {
        return '';
      }
      // le chiffre n'est écrit que si le segment a la place
      var texte = total && valeur / total >= 0.12 ? valeur : '';
      return '<span class="' + classe + '" style="flex: ' + valeur + ' 1 0" title="' + valeur + ' ' + libelle + (valeur > 1 ? 's' : '') + '">' + texte + '</span>';
    };
    var pc = matches ? Math.round(v / matches * 100) : 0;
    return '<span class="g-vnd"><span class="barre" role="img" aria-label="' + v + ' victoires, ' + n + ' nuls, ' + d + ' défaites">' +
      segment(v, 'V', 'victoire') + segment(n, 'N', 'nul') + segment(d, 'D', 'défaite') + '</span>' +
      '<span class="pc">' + pc + '\u00A0%</span></span>';
  };
  
  this.lieu = function (lieu) {
    var domicile = Bom.domicile(lieu) ? 'D' : 'E';
    return '<span class="icon-lieu ' + domicile + '" title="' + (domicile === 'D' ? 'À domicile' : 'À l\'extérieur') + '"></span><span class="g-lieu ' + domicile + '">' + lieu + '</span>';
  };

  this._club  = function (match, name) {
    return '<div class="icon-club-wrapper"><div class="icon-club club-' + match.idAdv + '"></div></div><span class="g-club">' + name + '</span>';
  };
  
  this.club = function (match) {
    return _this._club(match, match.nomAdv);
  };

  this.clubLink = function (match) {
    return _this._club(match, '<a href="#/matches/adversaire/' + match.idAdv + '">' + match.nomAdv + '</a>');
  };
  
  this.$Score = {
    table: 'table',
    badge: 'badge',
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
    
    if (formatting === _this.$Score.table || formatting === _this.$Score.badge) {
      var libelle = {V: 'Victoire', N: 'Nul', D: 'Défaite'}[resultat] || '';
      out = '<a href="#match/' + match.id + '" class="g-score ' + resultat + '" title="' + libelle + '">' + butsOM + '-' + butsAdv + '</a>';

      // le badge seul : sans « ap » ni tirs au but à côté
      if (formatting === _this.$Score.badge) {
        return out;
      }
      if (tabOM || tabAdv) {
        out += '<span class="g-remark">' + tabOM + '-' + tabAdv + ' t.a.b.</span>';
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
  
  // lignes des listes sur mobile (cartes)
  this.ligneMatch = function (match) {
    var date = isoDate(match.date) || '';
    var jour = parseInt(date.substr(8, 2), 10);
    var resultat = Bom.resultat(match);
    var libelle = {V: 'Victoire', N: 'Nul', D: 'Défaite'}[resultat] || '';
    var tabOM = parseInt(match.tabOM, 10) || 0, tabAdv = parseInt(match.tabAdv, 10) || 0;
    var rq = tabOM || tabAdv ? tabOM + '-' + tabAdv + ' t.a.b.' : (match.rqScore === 'ap' ? 'a.p.' : (match.rqScore || ''));
    var domicile = Bom.domicile(match.lieu);
    return '<div class="ligne-match">' +
      '<span class="date-bloc"><b>' + (jour || '') + '</b><span class="mois">' + (MOIS[parseInt(date.substr(5, 2), 10) - 1] || '') + '</span><span class="annee">' + date.substr(0, 4) + '</span></span>' +
      '<span class="milieu">' +
        '<span class="adv"><span class="icon-club-wrapper"><span class="icon-club club-' + match.idAdv + '"></span></span><span class="nom">' + match.nomAdv + '</span>' +
          '<span class="icon-lieu ' + (domicile ? 'D' : 'E') + '" title="' + (domicile ? 'À domicile' : 'À l\'extérieur') + ' · ' + match.lieu + '"></span></span>' +
        '<span class="comp" title="' + ((match.competition || '') + (match.niveau ? ' · ' + match.niveau : '')).replace(/"/g, '&quot;') + '">' + _this.sousTypeCompetition(match.sousTypeCompetition) + '<span class="niveau">' + _this.niveauCourt(match.niveau) + '</span></span>' +
        _this.jyEtais(match.jyEtais) +
      '</span>' +
      '<span class="droite"><span class="g-score ' + resultat + '" title="' + libelle + '">' + (parseInt(match.butsOM, 10) || 0) + '-' + (parseInt(match.butsAdv, 10) || 0) + '</span>' +
        (rq ? '<span class="rq">' + rq + '</span>' : '') + '</span>' +
      '</div>';
  };

  this.lignePersonne = function (personne) {
    var prenom = (personne.prenom || '').trim();
    var age = personne.dateDeces ? null : _this.age(personne.dateNaissance);
    var details = [personne.nationalite, age !== null ? _this.ans(age) : '', personne.villeNaissance].filter(Boolean).join(' · ');
    return '<div class="ligne-personne">' +
      (personne.fonctions !== undefined ? (personne.fonctions ? _this.fonction(personne.fonctions) : '<span></span>') :
        (personne.poste ? _this.poste(personne.poste) : '<span></span>')) +
      '<span class="milieu" style="min-width: 0; display: flex; flex-direction: column; gap: 2px">' +
        '<span class="nom">' + (prenom ? prenom + ' ' : '') + '<b>' + personne.nom + '</b></span>' +
        (personne.fonctions ? '<span class="details"><span>' + personne.fonctions.split(',').filter(function (f, i, all) { return all.indexOf(f) === i; }).join(', ') + '</span></span>' : '') +
        '<span class="details">' + (personne.nationalite ? '<img src="style/flags/large/' + personne.nationalite + '.png" alt="">' : '') + '<span>' + details + '</span></span>' +
      '</span>' +
      '<span class="periode">' + (personne.periode || '') + '</span>' +
      '</div>';
  };

  this.nomOm = function (saison) {
    return saison === '1943-44' ? 'MARSEILLE-PROVENCE' : 'OM';
  };
  
  this.match = function (match) {
    var left = Bom.domicile(match.lieu) ? _this.nomOm(match.saison) : match.nomAdv;
    var right = Bom.domicile(match.lieu) ? match.nomAdv : _this.nomOm(match.saison);
    return left + ' – ' + right;
  };

  this.matchLink = function (match) {
    return '<a href="#/match/' + match.id + '">' + _this.match(match) + '</a>';
  };
  
  this.matchTitle = function (match) {
    var left = Bom.domicile(match.fiche.lieu) ? _this.nomOm(match.fiche.saison) : match.adversaire.nom;
    var right = Bom.domicile(match.fiche.lieu) ? match.adversaire.nom : _this.nomOm(match.fiche.saison);
    return left + ' – ' + right;
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

  // un ballon par but, tous sur une seule ligne
  this.buts = function (nbButs) {
    var res = '';
    for (var i=0; i<nbButs; ++i) {
      res += '<span class="icon-but"></span>';
    }
    return nbButs ? '<span class="g-buts" role="img" aria-label="' + nbButs + ' but' + (nbButs > 1 ? 's' : '') + '">' + res + '</span>' : '';
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


