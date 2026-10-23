// Frise : la colonne de la saison survolée passe en bleu ciel, sans relancer Angular à chaque mouvement
app.directive('lvdlomFriseSurvol', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var frise = element[0];
      var derniere = null;
      var survol = function (event) {
        var col = parseInt(attrs.lvdlomFriseSurvol, 10) || 112;
        var libelle = parseInt(attrs.libelle, 10) || 150;
        var bande = frise.querySelector('.colonnes .survol');
        var titres = frise.querySelectorAll('.tete .saison');
        if (!bande) {
          return;
        }
        var x = event.clientX - frise.getBoundingClientRect().left - libelle;
        var index = x >= 0 ? Math.floor(x / col) : -1;
        if (index === derniere) {
          return;
        }
        derniere = index;
        if (derniere !== null) {
          angular.forEach(titres, function (titre) {
            titre.classList.remove('survol');
          });
        }
        var titre = null;
        angular.forEach(titres, function (t) {
          if (parseInt(t.style.left, 10) === libelle + index * col) {
            titre = t;
          }
        });
        if (index < 0 || !titre) {
          bande.hidden = true;
          return;
        }
        titre.classList.add('survol');
        bande.hidden = false;
        bande.style.left = (libelle + index * col) + 'px';
        bande.style.width = col + 'px';
      };
      var quitter = function () {
        derniere = null;
        var bande = frise.querySelector('.colonnes .survol');
        if (bande) {
          bande.hidden = true;
        }
        angular.forEach(frise.querySelectorAll('.tete .saison.survol'), function (titre) {
          titre.classList.remove('survol');
        });
      };
      frise.addEventListener('mousemove', survol);
      frise.addEventListener('mouseleave', quitter);
    }
  };
});
