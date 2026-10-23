app.directive('lvdlomFicheDirigeant', function (Bom, Picture, Formatter, Countries) {
  return {
    scope: {
      dirigeant: '=',
      cfg: '='
    },
    templateUrl: 'app/directives/dirigeant/fiche.html',
    controller: function ($scope) {

      // période en poste : « 2025 – 2026 », ou une seule année
      var periode = function (fonctions) {
        var debuts = [], fins = [], enPoste = false;
        (fonctions || []).forEach(function (f) {
          var debut = Formatter.isoDate(f.debut), fin = Formatter.isoDate(f.fin);
          if (debut) {
            debuts.push(parseInt(debut.substr(0, 4), 10));
          }
          if (fin) {
            fins.push(parseInt(fin.substr(0, 4), 10));
          } else {
            enPoste = true;
          }
        });
        if (!debuts.length) {
          return '';
        }
        var debut = Math.min.apply(null, debuts);
        var fin = enPoste ? new Date().getFullYear() : Math.max.apply(null, fins.length ? fins : debuts);
        return debut === fin ? String(debut) : debut + ' – ' + fin;
      };

      var render = function () {
        var dirigeant = $scope.dirigeant;
        if (!dirigeant || !dirigeant.fiche) {
          return;
        }
        var fiche = dirigeant.fiche;
        var mini = !!($scope.cfg && $scope.cfg.mini);

        var nationalite = fiche.nationalite ? {label: 'Nationalité', valeur: Countries.getLabel(fiche.nationalite) || fiche.nationalite, flag: fiche.nationalite} : null;
        var lieu = fiche.villeNaissance ? fiche.villeNaissance + (fiche.territoireNaissance ? ' (' + fiche.territoireNaissance + ')' : '') : '';
        var naissance = fiche.dateNaissance ? {label: 'Naissance', valeur: Formatter.dateLongue(fiche.dateNaissance), sub: lieu ? '· ' + lieu : '', large: true} :
          (lieu ? {label: 'Naissance', valeur: lieu, large: true} : null);
        var deces = fiche.dateDeces ? {label: 'Décès', valeur: Formatter.dateLongue(fiche.dateDeces),
          sub: fiche.dateNaissance ? '· à ' + Formatter.ans(Formatter.age(fiche.dateNaissance, fiche.dateDeces)) : ''} : null;
        var age = !fiche.dateDeces && fiche.dateNaissance ? {label: 'Âge', valeur: Formatter.ans(Formatter.age(fiche.dateNaissance))} : null;
        var titres = (dirigeant.fonctions || []).map(function (f) {
          return f.titre;
        }).filter(function (titre, index, all) {
          return titre && all.indexOf(titre) === index;
        });
        var fonction = titres.length ? {label: titres.length > 1 ? 'Fonctions' : 'Fonction', valeur: titres.join(', '), large: true} : null;
        var p = periode(dirigeant.fonctions);

        var prenom = (fiche.prenom || '').trim();
        $scope.hero = {
          mini: mini,
          aria: 'Identité du dirigeant',
          photo: Picture.dirigeant(dirigeant.id),
          photoAlt: 'Photo de ' + (prenom ? prenom + ' ' : '') + fiche.nom,
          initiales: (prenom ? prenom[0] : '') + (fiche.nom || '').substr(0, 1),
          prenom: prenom,
          nom: fiche.nom,
          faits: [nationalite, naissance, deces || age].filter(Boolean),
          faitsSous: (mini ?
            [fonction, nationalite, deces || age, naissance, p ? {label: 'Période', valeur: p} : null] :
            [nationalite, deces || age, naissance, p ? {label: 'Période', valeur: p, large: true, chiffre: true} : null]).filter(Boolean),
          periode: p
        };
      };

      render();

      $scope.$watch('dirigeant.fiche', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          render();
        }
      });
    }
  };
});
