app.directive('lvdlomFicheMatch', function (Bom, Picture, Formatter, ClubColors) {
  return {
    scope: {
      match: '=',
      cfg: '='
    },
    templateUrl: 'app/directives/match/fiche.html',
    controller: function ($scope) {

      // taille du nom selon sa longueur, pour qu'il tienne sur sa moitié
      var taille = function (nom) {
        var n = (nom || '').length;
        return n <= 4 ? 'xl' : (n <= 8 ? 'l' : (n <= 12 ? 'm' : 's'));
      };

      var team = function (id, nom, buts, tab, saison) {
        // Certains noms historiques contiennent des entités HTML. Décoder les
        // caractères seuls : le nom reste du texte, y compris dans les attributs.
        var decoder = window.document.createElement('textarea');
        nom = (nom || '').replace(/&(?:#\d+|#x[\da-f]+|[a-z][a-z\d]+);/gi, function (entity) {
          decoder.innerHTML = entity;
          return decoder.value;
        });
        var t = {
          id: id,
          nom: nom,
          buts: parseInt(buts, 10) || 0,
          tab: parseInt(tab, 10) || 0,
          crest: Picture.club(id, saison),
          maillot: id === 'OM' ? {idClub: 'OM', nomClub: 'OM', saison: saison} : {idClub: id, nomClub: nom},
          colors: ClubColors.initial(id),
          taille: taille(nom)
        };
        ClubColors.get(id, saison).then(function (colors) {
          t.colors = colors;
        });
        return t;
      };

      // render
      var render = function () {
        if (!$scope.match || !$scope.match.fiche) {
          return;
        }
        var fiche = $scope.match.fiche;
        var domicile = Bom.domicile(fiche.lieu);
        var om = team('OM', Formatter.nomOm(fiche.saison), fiche.butsOM, fiche.tabOM, fiche.saison);
        var adv = team($scope.match.adversaire.id, $scope.match.adversaire.nom, fiche.butsAdv, fiche.tabAdv, fiche.saison);
        $scope.left = domicile ? om : adv;
        $scope.right = domicile ? adv : om;

        var tab = $scope.left.tab + '-' + $scope.right.tab;
        $scope.rq = fiche.rqScore === 'tab' ? 'Tirs au but · ' + tab : (fiche.rqScore === 'ap' ? 'Après prolongation' : '');
        $scope.rqCourt = fiche.rqScore === 'tab' ? 'T.a.b. ' + tab : (fiche.rqScore === 'ap' ? 'Après prol.' : '');

        var sousType = (($scope.match.competition && $scope.match.competition.sousType) || '').trim();
        $scope.badge = sousType ? Formatter.sousTypeCompetition(sousType) : '';
        $scope.competition = Formatter.niveauLong((($scope.match.competition && $scope.match.competition.nom) || fiche.competition || '') +
          (fiche.niveau ? ' · ' + fiche.niveau : ''));

        var spectateurs = parseInt(fiche.spectateurs, 10) > 0 ? Formatter.milliers(fiche.spectateurs) : '';
        var date = Formatter.dateJour(fiche.date);
        $scope.meta = [date, fiche.lieu, spectateurs ? spectateurs + ' spectateurs' : ''].filter(Boolean).join(' · ');
        $scope.metaCourt = [date, fiche.lieu, spectateurs ? spectateurs + ' spect.' : ''].filter(Boolean).join(' · ');

        $scope.jy = Formatter.jyEtais(fiche.jyEtais);
        $scope.scoreAria = 'Score : ' + $scope.left.buts + ' à ' + $scope.right.buts + ($scope.rq ? ', ' + $scope.rq : '');
      };

      render();

      // watch
      $scope.$watch('match', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          render();
        }
      });
      $scope.$watch('match.$resolved', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          render();
        }
      });
    }
  };
});
