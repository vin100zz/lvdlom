app.directive('lvdlomFicheJoueur', function (Bom, Picture, Formatter, Countries) {
  return {
    scope: {
      joueur: '=',
      cfg: '='
    },
    templateUrl: 'app/directives/joueur/fiche.html',
    controller: function ($scope) {

      var render = function () {
        var joueur = $scope.joueur;
        if (!joueur || !joueur.fiche) {
          return;
        }
        var fiche = joueur.fiche;
        var mini = !!($scope.cfg && $scope.cfg.mini);

        // la valeur suffit : pas d'étiquette « Poste » ni « Nationalité » à l'écran
        var poste = fiche.poste ? {label: 'Poste', sansLabel: true, valeur: Bom.poste(fiche.poste), poste: fiche.poste} : null;
        var nationalite = fiche.nationalite ? {label: 'Nationalité', sansLabel: true, valeur: Countries.getLabel(fiche.nationalite) || fiche.nationalite, flag: fiche.nationalite} : null;
        var lieu = fiche.villeNaissance ? fiche.villeNaissance + (fiche.territoireNaissance ? ' (' + fiche.territoireNaissance + ')' : '') : '';
        var naissance = fiche.dateNaissance ? {label: 'Naissance', valeur: Formatter.dateLongue(fiche.dateNaissance), sub: lieu ? '· ' + lieu : '', large: true} :
          (lieu ? {label: 'Naissance', valeur: lieu, large: true} : null);
        var deces = fiche.dateDeces ? {label: 'Décès', valeur: Formatter.dateLongue(fiche.dateDeces),
          sub: fiche.dateNaissance ? '· à ' + Formatter.ans(Formatter.age(fiche.dateNaissance, fiche.dateDeces)) : ''} : null;
        var age = !fiche.dateDeces && fiche.dateNaissance ? {label: 'Âge', valeur: Formatter.ans(Formatter.age(fiche.dateNaissance))} : null;
        var selections = parseInt(fiche.selections, 10) > 0 ? {label: 'Sélections', valeur: fiche.selections} : null;

        var bilan = joueur.bilan || {};
        var total = (bilan.total && bilan.total.total) || {tit: 0, rmp: 0, buts: 0};
        var nbMatches = (parseInt(total.tit, 10) || 0) + (parseInt(total.rmp, 10) || 0);
        var nbButs = parseInt(total.buts, 10) || 0;
        var periode = Formatter.periodeSaisons(Object.keys(bilan));

        var faits = [poste, nationalite, naissance, deces || age, selections].filter(Boolean);
        var faitsSous = mini ?
          [poste, nationalite, naissance, deces || age, periode ? {label: 'Période', valeur: periode} : null] :
          [nationalite, deces || age, naissance, selections,
            {label: 'Matches', valeur: String(nbMatches), chiffre: true},
            {label: nbButs > 1 ? 'Buts' : 'But', valeur: String(nbButs), chiffre: true}];

        var prenom = (fiche.prenom || '').trim();
        $scope.hero = {
          mini: mini,
          aria: 'Identité du joueur',
          photo: Picture.joueur(joueur.id),
          photoAlt: 'Photo de ' + (prenom ? prenom + ' ' : '') + fiche.nom,
          initiales: (prenom ? prenom[0] : '') + (fiche.nom || '').substr(0, 1),
          prenom: prenom,
          nom: fiche.nom,
          badge: fiche.auClub === '1' || fiche.auClub === 'Y' ? 'Au club' : '',
          poste: fiche.poste ? {code: fiche.poste, label: Bom.poste(fiche.poste)} : null,
          faits: faits,
          faitsSous: faitsSous.filter(Boolean),
          chiffres: [
            {valeur: nbMatches, label: nbMatches > 1 ? 'matches' : 'match', or: true},
            {valeur: nbButs, label: nbButs > 1 ? 'buts' : 'but'}
          ]
        };
      };

      render();

      $scope.$watch('joueur.fiche', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          render();
        }
      });
    }
  };
});
