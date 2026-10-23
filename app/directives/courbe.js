// Courbe de parcours (palmarès) : une couleur par compétition, la valeur dans la pastille quand
// les saisons sont assez espacées, les titres en or, et au survol la liste des matches de la saison.
app.directive('lvdlomCourbe', function () {

  var NAVY = '#0A2240', GOLD = '#F2A516', SLATE = '#5A6878';

  // couleur du badge de chaque compétition (charte · graphiques)
  var COULEURS = {
    'Championnat Pro': '#5B3CC4',
    'Championnat Fédéral': '#0E7490',
    'Championnat Amateur': '#64748B',
    'C1': '#0B0F2E',
    'C2': '#7C3AED',
    'C3/C4': '#E35205',
    'Coupe des Villes de Foire': '#B07A12',
    'Coupe de France': '#D42A38',
    'Coupe Charles-Simon': '#8F1D2C',
    'Coupe de la Ligue': '#0F766E',
    'Coupe Drago': '#0E7490',
    'Coupe de la Libération': '#64748B'
  };
  var PALETTE = ['#5B3CC4', '#0E7490', '#E35205', '#7C3AED', '#0F766E', '#64748B'];

  var echapper = function (texte) {
    return String(texte).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  // « (D1) 2ème [14] » → {groupe: 'D1', texte: '2e', nombre: '14'}
  var lireNiveau = function (label) {
    var m = /^\s*(?:\(([^)]*)\)\s*)?(.*?)\s*(?:\[(\d+)\])?\s*$/.exec(label || '');
    var texte = (m[2] || '').replace(/(\d+)\s*ème/g, '$1e').replace(/(\d+)\s*ère/g, '$1re');
    return {groupe: m[1] || '', texte: texte, nombre: m[3] || ''};
  };

  // texte court écrit dans la pastille : rang, ou tour atteint
  var court = function (niveau) {
    var t = niveau.texte.toLowerCase();
    var m;
    if (/^champion|^vainqueur/.test(t)) { return niveau.groupe ? '1' : 'V'; }
    if ((m = /^(\d+)\s*(?:re|e|er)?$/.exec(t))) { return m[1]; }
    if (/^finaliste|^finale/.test(t)) { return 'F'; }
    if (/^demi/.test(t)) { return '½'; }
    if (/^quart/.test(t)) { return '¼'; }
    if ((m = /^1\/(\d+)/.exec(t))) { return m[1] + 'e'; }
    if (/^phase de groupes|^poules/.test(t)) { return 'P'; }
    if ((m = /^(\d+)\s*(?:re|e|er)\s+tour/.exec(t))) { return 'T' + m[1]; }
    return niveau.texte.substr(0, 2);
  };

  var lireMatch = function (texte) {
    var m = /^(.*)\s(\d+)-(\d+)$/.exec(texte || '');
    return m ? {adv: m[1], om: parseInt(m[2], 10), adv2: parseInt(m[3], 10)} : {adv: texte, om: null, adv2: null};
  };

  return {
    scope: {
      cfg: '='
    },
    template: '<div class="dir-courbe"><div class="legende"></div><div class="zone"><div class="defilement"><div class="dessin"></div></div><div class="infobulle" role="tooltip" hidden></div></div></div>',
    link: function (scope, element) {
      var racine = element[0];
      var dessin = racine.querySelector('.dessin');
      var legende = racine.querySelector('.legende');
      var infobulle = racine.querySelector('.infobulle');
      var points = [];

      var render = function () {
        var cfg = scope.cfg;
        if (!cfg || !cfg.competitions || !cfg.competitions.length) {
          return;
        }
        var niveaux = {};
        var vmax = 1;
        (cfg.niveaux || []).forEach(function (n) {
          niveaux[n.Value] = lireNiveau(n.Label);
          vmax = Math.max(vmax, n.Value);
        });

        // saisons : de la première à la dernière où une compétition apparaît
        var saisons = Object.keys(cfg.competitions[0].Histo).sort();
        var utiles = saisons.filter(function (s) {
          return cfg.competitions.some(function (c) {
            return c.Histo[s] && c.Histo[s].Niveau !== null && c.Histo[s].Niveau !== undefined;
          });
        });
        if (utiles.length) {
          saisons = saisons.slice(saisons.indexOf(utiles[0]), saisons.indexOf(utiles[utiles.length - 1]) + 1);
        }

        var series = cfg.competitions.map(function (c, index) {
          return {
            nom: c.Nom,
            couleur: COULEURS[c.Nom] || PALETTE[index % PALETTE.length],
            valeurs: saisons.map(function (s) {
              return c.Histo[s] && c.Histo[s].Niveau ? c.Histo[s].Niveau : null;
            }),
            matches: c.Matches || {}
          };
        }).filter(function (s) {
          return s.valeurs.some(function (v) { return v !== null; });
        });

        var largeurDispo = racine.querySelector('.defilement').clientWidth || 800;
        var mobile = largeurDispo < 640;
        var gauche = mobile ? 92 : 150, droite = 18, haut = 18, bas = 40;
        var largeur = Math.max(largeurDispo, gauche + droite + saisons.length * (mobile ? 9 : 6));
        var hauteur = cfg.hauteur || 300;
        var L = gauche, R = largeur - droite, T = haut, B = hauteur - bas;
        var pw = R - L, ph = B - T;
        var n = Math.max(saisons.length - 1, 1);
        var X = function (i) { return L + pw * i / n; };
        var Y = function (v) { return vmax > 1 ? T + ph * (v - 1) / (vmax - 1) : T + ph / 2; };
        var pas = pw / n;
        var ecrire = pas >= 21;
        var pasY = vmax > 1 ? ph / (vmax - 1) : ph;

        var o = [];
        o.push('<svg width="' + largeur + '" height="' + hauteur + '" viewBox="0 0 ' + largeur + ' ' + hauteur + '" role="img" aria-label="' +
          echapper((cfg.titre || 'Parcours') + ', de ' + saisons[0] + ' à ' + saisons[saisons.length - 1]) + '">');

        // bandes grises pour les divisions inférieures (« Division 2 »…)
        var groupes = [];
        for (var v = 1; v <= vmax; ++v) {
          var g = niveaux[v] ? niveaux[v].groupe : '';
          if (!groupes.length || groupes[groupes.length - 1].nom !== g) {
            groupes.push({nom: g, debut: v, fin: v});
          } else {
            groupes[groupes.length - 1].fin = v;
          }
        }
        groupes.forEach(function (gr, index) {
          if (index % 2 === 1) {
            var y0 = Y(gr.debut - 0.5), y1 = Math.min(Y(gr.fin + 0.5), B);
            o.push('<rect x="' + L + '" y="' + y0.toFixed(1) + '" width="' + pw + '" height="' + (y1 - y0).toFixed(1) + '" fill="#F4F6F9"></rect>');
          }
          if (gr.nom && groupes.length > 1) {
            o.push('<text x="' + (R - 8) + '" y="' + (Math.min(Y(gr.fin + 0.5), B) - 6).toFixed(1) + '" text-anchor="end" font-size="11" font-weight="600" fill="#8A97A6">' +
              echapper(gr.nom.replace(/^D(\d)$/, 'Division $1')) + '</text>');
          }
        });

        // grille horizontale et libellés des niveaux
        var tous = pasY >= 13;
        for (v = 1; v <= vmax; ++v) {
          if (!tous && v % 2 === 0 && v !== 1) {
            continue;
          }
          var niv = niveaux[v] || {texte: String(v), groupe: '', nombre: ''};
          var texte = (niv.groupe && groupes.length > 1 ? niv.groupe + ' · ' : '') + niv.texte;
          o.push('<line x1="' + L + '" x2="' + R + '" y1="' + Y(v).toFixed(1) + '" y2="' + Y(v).toFixed(1) + '" stroke="#E4E8EE"></line>');
          o.push('<text x="' + (L - 12) + '" y="' + (Y(v) + 4).toFixed(1) + '" text-anchor="end" font-size="' + (mobile ? 11 : 12) + '" fill="' + SLATE + '">' + echapper(texte) +
            (niv.nombre && !mobile ? '<tspan fill="#8A97A6"> (' + niv.nombre + ')</tspan>' : '') + '</text>');
        }

        // années
        var tous5 = Math.max(1, Math.ceil(64 / pas));
        saisons.forEach(function (s, i) {
          var dernier = i === saisons.length - 1;
          // la dernière année est toujours écrite ; on saute celle qui la chevaucherait
          if (dernier || (i % tous5 === 0 && saisons.length - 1 - i >= tous5)) {
            o.push('<text x="' + X(i).toFixed(1) + '" y="' + (hauteur - 12) + '" text-anchor="middle" font-size="12" fill="' + SLATE + '">' + s + '</text>');
            o.push('<line x1="' + X(i).toFixed(1) + '" x2="' + X(i).toFixed(1) + '" y1="' + B + '" y2="' + (B + 5) + '" stroke="#D5DCE4"></line>');
          }
        });
        o.push('<line x1="' + L + '" x2="' + R + '" y1="' + B + '" y2="' + B + '" stroke="#C9D3DE"></line>');

        // traits : 2 px, sans zone pleine
        series.forEach(function (serie) {
          var vals = serie.valeurs;
          for (var i = 0; i < vals.length - 1; ++i) {
            if (vals[i] !== null && vals[i + 1] !== null) {
              o.push('<line x1="' + X(i).toFixed(1) + '" y1="' + Y(vals[i]).toFixed(1) + '" x2="' + X(i + 1).toFixed(1) + '" y2="' + Y(vals[i + 1]).toFixed(1) +
                '" stroke="' + serie.couleur + '" stroke-width="2.2" stroke-linecap="round"></line>');
            }
          }
        });

        // pastilles
        points = [];
        o.push('<circle class="anneau" cx="-50" cy="-50" r="' + (ecrire ? 15 : 9) + '" fill="none" stroke="' + NAVY + '" stroke-width="2" stroke-opacity=".35"></circle>');
        series.forEach(function (serie) {
          serie.valeurs.forEach(function (v, i) {
            if (v === null) {
              return;
            }
            var titre = v === 1;
            var fond = titre ? GOLD : serie.couleur, texteCouleur = titre ? NAVY : '#FFFFFF';
            var niv = niveaux[v] || {texte: String(v), groupe: ''};
            if (ecrire) {
              var lab = court(niv);
              o.push('<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="10.5" fill="' + fond + '" stroke="#FFFFFF" stroke-width="2"></circle>' +
                '<text x="' + X(i).toFixed(1) + '" y="' + (Y(v) + 3.9).toFixed(1) + '" text-anchor="middle" font-size="' + (lab.length < 3 ? 11 : 9.5) +
                '" font-weight="700" fill="' + texteCouleur + '" pointer-events="none">' + echapper(lab) + '</text>');
            } else {
              o.push('<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="4.5" fill="' + fond + '" stroke="#FFFFFF" stroke-width="1.5"></circle>');
            }
            points.push({x: X(i), y: Y(v), saison: saisons[i], niveau: niv, serie: serie});
          });
        });
        o.push('</svg>');
        dessin.innerHTML = o.join('');
        dessin.style.width = largeur + 'px';

        // légende : une pastille par compétition, l'or pour les titres
        legende.innerHTML = series.map(function (serie) {
          return '<span><span class="puce" style="background: ' + serie.couleur + '"></span>' + echapper(serie.nom) + '</span>';
        }).join('') + '<span><span class="puce" style="background: ' + GOLD + '"></span>' + (cfg.titreGagne || 'Vainqueur') + '</span>';
      };

      // survol : la pastille la plus proche est entourée, l'infobulle liste les matches de la saison
      var cacher = function () {
        infobulle.hidden = true;
        var anneau = dessin.querySelector('.anneau');
        if (anneau) {
          anneau.setAttribute('cx', -50);
          anneau.setAttribute('cy', -50);
        }
      };
      var survol = function (event) {
        var svg = dessin.querySelector('svg');
        if (!svg || !points.length) {
          return;
        }
        var box = svg.getBoundingClientRect();
        var x = event.clientX - box.left, y = event.clientY - box.top;
        var meilleur = null, distance = Infinity;
        points.forEach(function (p) {
          var d = Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2);
          if (d < distance) {
            distance = d;
            meilleur = p;
          }
        });
        if (!meilleur || distance > 30 * 30) {
          cacher();
          return;
        }
        var anneau = dessin.querySelector('.anneau');
        anneau.setAttribute('cx', meilleur.x.toFixed(1));
        anneau.setAttribute('cy', meilleur.y.toFixed(1));

        var matches = (meilleur.serie.matches[meilleur.saison] || []).map(lireMatch);
        var bilan = {v: 0, n: 0, d: 0};
        matches.forEach(function (m) {
          if (m.om === null) { return; }
          if (m.om > m.adv2) { ++bilan.v; } else if (m.om === m.adv2) { ++bilan.n; } else { ++bilan.d; }
        });
        var colonnes = Math.min(3, Math.max(1, Math.ceil(matches.length / 12)));
        var lignes = Math.max(1, Math.ceil(matches.length / colonnes));
        var cellules = matches.map(function (m) {
          var classe = m.om === null ? '' : (m.om > m.adv2 ? 'V' : (m.om === m.adv2 ? 'N' : 'D'));
          return '<span class="ligne"><span class="adv">' + echapper(m.adv) + '</span>' +
            (m.om !== null ? '<span class="g-score ' + classe + '">' + m.om + '-' + m.adv2 + '</span>' : '') + '</span>';
        }).join('');
        infobulle.innerHTML = '<div class="tete"><b>' + meilleur.saison + ' · ' + echapper(meilleur.niveau.texte) + '</b>' +
          (matches.length ? '<span>' + matches.length + ' match' + (matches.length > 1 ? 'es' : '') + ' · ' + bilan.v + ' V · ' + bilan.n + ' N · ' + bilan.d + ' D</span>' : '') +
          '<span class="competition">' + echapper(meilleur.serie.nom) + '</span></div>' +
          (matches.length ? '<div class="matches" style="grid-template-rows: repeat(' + lignes + ', 22px); grid-template-columns: repeat(' + colonnes + ', 160px)">' + cellules + '</div>' : '');
        infobulle.hidden = false;

        // à droite de la pastille, ou à gauche si la place manque
        var zone = racine.querySelector('.zone').getBoundingClientRect();
        var px = box.left - zone.left + meilleur.x, py = box.top - zone.top + meilleur.y;
        var w = infobulle.offsetWidth, h = infobulle.offsetHeight;
        var left = px + 22 + w > zone.width ? px - 22 - w : px + 22;
        var top = Math.max(0, Math.min(py - 20, zone.height - h));
        infobulle.style.left = Math.max(0, left) + 'px';
        infobulle.style.top = top + 'px';
      };

      dessin.addEventListener('mousemove', survol);
      dessin.addEventListener('mouseleave', cacher);

      var timer = null;
      var onResize = function () {
        window.clearTimeout(timer);
        timer = window.setTimeout(render, 150);
      };
      window.addEventListener('resize', onResize);
      scope.$on('$destroy', function () {
        window.removeEventListener('resize', onResize);
      });

      scope.$watch('cfg', function () {
        window.setTimeout(render, 0);
      });
    }
  };
});
