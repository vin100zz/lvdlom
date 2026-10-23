(function () {

  'use strict';

  // controller
  app.controller('TimelineCtrl', function($scope, $injector, $routeParams, EquipeTypes, Palmares, Formatter) {

    $injector.invoke(AbstractModuleCtrl, this, {$scope: $scope, pageTitle: 'Timeline'});

    $scope.Formatter = Formatter;

    $scope.saisons = [];
    $scope.groupes = [];
    $scope.palmares = {championnat: {}, coupeFrance: {}, coupeEurope: {}};

    var FIRST_SAISON = "1923-24";

    // une colonne par saison, la colonne des libellés reste visible au défilement
    var COL = 112;
    var LIBELLE = 150;
    $scope.COL = COL;
    $scope.LIBELLE = LIBELLE;

    // résultats en pastilles : or pour un titre, gris clair sinon (charte · frise)
    var PALMARES_LABELS = {
      championnat: function (niveau) {
        if (!niveau) {return null;}
        if (niveau <= 20) {return {label: niveau === 1 ? '1er' : niveau + 'e', titre: niveau === 1};}
        return {label: 'D2 · ' + (niveau === 21 ? '1er' : (niveau - 20) + 'e')};
      },
      coupeFrance: function (niveau) {
        if (!niveau) {return null;}
        return {label: ['V', 'F', '1/2', '1/4', '1/8', '1/16', '1/32', '6e t.'][niveau-1], titre: niveau === 1};
      },
      coupeEurope: function (niveau, nom) {
        if (!niveau) {return null;}
        return {
          label: ['V', 'F', '1/2', '1/4', '1/8', 'Poules', '1/16', '1/32', '1er t.'][niveau-1],
          titre: niveau === 1,
          badge: {'C1': 'C1', 'C2': 'C2', 'C3/C4': 'C3', 'Coupe des Villes de Foire': 'FO'}[nom] || ''
        };
      }
    };

    var indexSaison = function (saison) {
      return parseInt(saison.substr(0, 4), 10) - parseInt(FIRST_SAISON.substr(0, 4), 10);
    };

    // initiales d'un prénom composé : « Jean-Pierre » → « J.-P. »
    var initiales = function (prenom) {
      return prenom ? prenom.split('-').filter(Boolean).map(function (p) { return p[0] + '.'; }).join('-') : '';
    };

    // prénom entier s'il tient dans la barre, sinon l'initiale, sinon le nom seul
    var prenomQuiTient = function (personne, largeur, meta) {
      var place = largeur - 6 - 20 - 8 - meta.length * 6.4;
      var nom = personne.nom.length * 8.6;
      var prenom = (personne.prenom || '').trim();
      var candidats = [prenom, initiales(prenom), ''];
      for (var i = 0; i < candidats.length; ++i) {
        if (candidats[i].length * 7.1 + (candidats[i] ? 5 : 0) + nom <= place) {
          return candidats[i];
        }
      }
      return '';
    };

    // répartit les barres sur le moins de lignes possible, sans chevauchement
    var lignes = function (items) {
      var rangs = [];
      items.sort(function (a, b) {
        return a.debut - b.debut || (b.fin - b.debut) - (a.fin - a.debut) || b.matches - a.matches;
      }).forEach(function (item) {
        for (var i = 0; i < rangs.length; ++i) {
          if (rangs[i][rangs[i].length - 1].fin < item.debut) {
            rangs[i].push(item);
            return;
          }
        }
        rangs.push([item]);
      });
      return rangs;
    };

    var barres = function (items, style, lien) {
      return lignes(items).map(function (rang) {
        return rang.map(function (item) {
          var largeur = (item.fin - item.debut + 1) * COL;
          // les dirigeants n'ont pas de matches dans les équipes-types : pas de total
          item.meta = item.joueur ? item.matches + ' m' + (item.buts ? ' · ' + item.buts + ' b' : '') : '';
          item.prenomAffiche = prenomQuiTient(item, largeur, item.meta);
          item.style = style;
          item.lien = lien + item.id;
          item.position = {left: (LIBELLE + item.debut * COL + 3) + 'px', width: (largeur - 6) + 'px'};
          item.titre = [((item.prenom || '').trim() + ' ' + item.nom).trim(), item.premiere + (item.premiere !== item.derniere ? ' → ' + item.derniere : ''), item.meta].filter(Boolean).join(' · ');
          return item;
        });
      });
    };

    var buildPalmares = function (data, index, holder) {
      (data[index] ? data[index].competitions : []).forEach(function (competition) {
        Object.keys(competition.Histo).forEach(function (saison) {
          $scope.palmares[holder][saison] = $scope.palmares[holder][saison] || PALMARES_LABELS[holder](competition.Histo[saison].Niveau, competition.Nom);
        });
      });
    };

    // Palmarès
    Palmares.get(null, function (data) {
      buildPalmares(data, 0, 'championnat');
      buildPalmares(data, 1, 'coupeEurope');
      buildPalmares(data, 2, 'coupeFrance');
    });

    // Equipe-types
    EquipeTypes.get(null, function (saisons) {
      $scope.saisons = saisons.filter(function (saison) {
        return saison.id >= FIRST_SAISON;
      });
      $scope.largeur = LIBELLE + (indexSaison($scope.saisons[$scope.saisons.length - 1].id) + 1) * COL;
      $scope.colonnes = $scope.saisons.map(function (saison) {
        return {id: saison.id, left: LIBELLE + indexSaison(saison.id) * COL};
      });

      // présences : saisons consécutives regroupées en une barre
      var passages = {};
      var ajouter = function (cle, personne, saison, matches, buts) {
        var liste = passages[cle] || (passages[cle] = []);
        var i = indexSaison(saison);
        var dernier = liste[liste.length - 1];
        if (dernier && dernier.fin >= i - 1) {
          dernier.fin = i;
          dernier.derniere = saison;
          dernier.matches += matches;
          dernier.buts += buts;
        } else {
          liste.push({id: personne.id, prenom: personne.prenom, nom: personne.nom, poste: personne.poste, idFonction: personne.idFonction,
            debut: i, fin: i, premiere: saison, derniere: saison, matches: matches, buts: buts});
        }
      };

      $scope.saisons.forEach(function (saison) {
        var buts = {};
        (saison.buteurs || []).forEach(function (buteur) {
          buts[buteur.id] = parseInt(buteur.nbButs, 10) || 0;
        });
        saison.joueurs
        .slice()
        .sort(function (joueur1, joueur2) {
          return (parseInt(joueur2.nbTit, 10) || 0) - (parseInt(joueur1.nbTit, 10) || 0);
        })
        .slice(0, 15)
        .forEach(function (joueur) {
          ajouter('j' + joueur.id, joueur, saison.id, parseInt(joueur.nbMatches, 10) || 0, buts[joueur.id] || 0);
        });

        (saison.dirigeants || [])
        .filter(function (dirigeant) {
          return ['1', '2', '5', '6', '7', '8', '10', '12'].indexOf(dirigeant.idFonction) >= 0;
        })
        .forEach(function (dirigeant) {
          ajouter('d' + dirigeant.idFonction + '-' + dirigeant.id, dirigeant, saison.id, parseInt(dirigeant.nbMatches, 10) || 0, 0);
        });
      });

      var tous = Object.keys(passages).reduce(function (liste, cle) {
        return liste.concat(passages[cle].map(function (p) {
          p.joueur = cle[0] === 'j';
          return p;
        }));
      }, []);

      // présidents puis entraîneurs, ensuite les joueurs par poste, sans jamais mélanger les postes
      var GROUPES = [
        {nom: 'Présidents', style: 'president', lien: '#/dirigeant/', filtre: function (p) { return !p.joueur && p.idFonction !== '1'; }},
        {nom: 'Entraîneurs', style: 'entraineur', lien: '#/dirigeant/', filtre: function (p) { return !p.joueur && p.idFonction === '1'; }},
        {nom: 'Gardiens', style: 'GA', lien: '#/joueur/', filtre: function (p) { return p.joueur && p.poste === 'GA'; }},
        {nom: 'Défenseurs', style: 'DE', lien: '#/joueur/', filtre: function (p) { return p.joueur && p.poste === 'DE'; }},
        {nom: 'Milieux', style: 'MI', lien: '#/joueur/', filtre: function (p) { return p.joueur && p.poste === 'MI'; }},
        {nom: 'Attaquants', style: 'AV', lien: '#/joueur/', filtre: function (p) { return p.joueur && p.poste === 'AV'; }}
      ];
      $scope.groupes = GROUPES.map(function (groupe) {
        return {nom: groupe.nom, lignes: barres(tous.filter(groupe.filtre), groupe.style, groupe.lien)};
      }).filter(function (groupe) {
        return groupe.lignes.length;
      });
    });

  });

}) ();
