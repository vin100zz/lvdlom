// Frise : la colonne de la saison survolée passe en bleu ciel, sans relancer Angular à chaque mouvement ;
// au survol (ou au focus) d'une barre, une infobulle donne le nom complet, la période, les matches et les buts
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

      // infobulle : sous la barre, ou au-dessus si la place manque, toujours dans l'écran
      var echapper = function (texte) {
        return String(texte || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      };
      var barreCourante = null;
      var montrer = function (barre) {
        var infobulle = frise.querySelector('.infobulle');
        if (!infobulle || barre === barreCourante) {
          return;
        }
        barreCourante = barre;
        infobulle.innerHTML = '<b>' + echapper(barre.getAttribute('data-nom')) + '</b>' +
          '<span class="periode">' + echapper(barre.getAttribute('data-periode')) + '</span>' +
          '<span class="stats">' + echapper(barre.getAttribute('data-stats')) + '</span>';
        infobulle.hidden = false;
        var rect = barre.getBoundingClientRect();
        var w = infobulle.offsetWidth, h = infobulle.offsetHeight;
        var left = Math.max(8, Math.min(rect.left, window.innerWidth - w - 8));
        var top = rect.bottom + 6 + h > window.innerHeight ? rect.top - 6 - h : rect.bottom + 6;
        infobulle.style.left = left + 'px';
        infobulle.style.top = top + 'px';
      };
      var cacher = function () {
        barreCourante = null;
        var infobulle = frise.querySelector('.infobulle');
        if (infobulle) {
          infobulle.hidden = true;
        }
      };
      var barreDe = function (cible) {
        return cible && cible.closest ? cible.closest('.barre') : null;
      };
      var surBarre = function (event) {
        var barre = barreDe(event.target);
        if (barre) {
          montrer(barre);
        }
      };
      var horsBarre = function (event) {
        if (barreDe(event.target) && barreDe(event.relatedTarget) !== barreDe(event.target)) {
          cacher();
        }
      };

      var defilement = frise.parentNode;
      frise.addEventListener('mousemove', survol);
      frise.addEventListener('mouseleave', quitter);
      frise.addEventListener('mouseover', surBarre);
      frise.addEventListener('mouseout', horsBarre);
      frise.addEventListener('focusin', surBarre);
      frise.addEventListener('focusout', horsBarre);
      defilement.addEventListener('scroll', cacher);
      scope.$on('$destroy', function () {
        defilement.removeEventListener('scroll', cacher);
      });
    }
  };
});
