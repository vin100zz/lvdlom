// Favori « Envoyer à LVDLOM » : depuis la page d'un match, il ouvre cette saisie avec la page dans
// l'adresse (#/saisie/new/match?import=…). On la lit avant le démarrage d'Angular, puis on la retire
// de l'adresse : elle pèse plusieurs dizaines de Ko.
app.value('PageEnvoyee', (function () {
  var marque = '?import=';
  var hash = window.location.hash;
  var position = hash.indexOf(marque);
  var envoi = {page: null};

  if (position >= 0) {
    try {
      envoi.page = JSON.parse(decodeURIComponent(hash.substr(position + marque.length)));
    } catch (e) {}
    window.history.replaceState(null, '', window.location.pathname + window.location.search + hash.substr(0, position));
  }
  return envoi;
}) ());

// Lien à glisser dans la barre de favoris. Sur la page d'un match (L'Équipe, Google…), il copie la page
// sans scripts, styles ni attributs (les images deviennent leur nom : [ico_but]) et l'envoie à la saisie.
// Le code part dans une adresse javascript: : ni commentaire ni retour à la ligne dans la fonction.
app.directive('lvdlomFavoriImport', function () {
  return {
    link: function (scope, element) {
      var envoyer = function () {
        var copie = document.body.cloneNode(true);
        [].forEach.call(copie.querySelectorAll('script,style,svg,noscript,iframe,link,meta,template,video,audio,canvas'), function (e) {
          e.parentNode.removeChild(e);
        });
        [].forEach.call(copie.querySelectorAll('img'), function (e) {
          var nom = e.getAttribute('alt') || (e.getAttribute('src') || '').split('/').pop().split(/[.?]/)[0];
          e.parentNode.replaceChild(document.createTextNode(nom ? ' [' + nom + '] ' : ' '), e);
        });
        [].forEach.call(copie.querySelectorAll('*'), function (e) {
          while (e.attributes.length) {
            e.removeAttribute(e.attributes[0].name);
          }
        });
        var html = copie.innerHTML.replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').slice(0, 300000);
        window.open(SITE + '\x23/saisie/new/match?import=' + encodeURIComponent(JSON.stringify({url: location.href, titre: document.title, html: html})));
      };

      var site = window.location.href.split('#')[0];
      element.attr('href', 'javascript:(' + envoyer.toString().replace('SITE', JSON.stringify(site)).replace(/\s+/g, ' ') + ')();');

      // sur ce site, le lien ne sert qu'à être glissé dans les favoris
      element.on('click', function (evt) {
        evt.preventDefault();
      });
    }
  };
});

app.directive('lvdlomSaisieCommonMatch', function () {
  return {
    scope: {
      cfg: '='
    },
    templateUrl: 'app/directives/saisie/common/match.html',
    controller: function ($scope, $rootScope, $http, Dictionary, Formatter, Widget, Picture, PageEnvoyee) {
      $scope.Widget = Widget;
      $scope.Picture = Picture;

      $scope.dictionary = {
        joueurs: Dictionary.joueurs(),
        joueursAuClub: Dictionary.joueursAuClub(),
        dirigeants: Dictionary.dirigeants(),
        saisons: Dictionary.saisons(),
        lieux: Dictionary.lieux(),
        competitions: Dictionary.competitions(),
        niveaux: Dictionary.niveaux(),
        adversaires: Dictionary.adversaires(),
        jyEtais: Dictionary.jyEtais(),
        rqScore: ['ap', 'tab'],
        carton: ['A', 'E']
      };

      $scope.cfg.data = {
        type: 'match',
        butsOM: 0,
        butsAdv: 0,
        tabOM: 0,
        tabAdv: 0,
        buteursOM: [],
        buteursAdv: [],
        titulaires: [],
        remplacants: [],
        classement: []
      };

      function titulaireVide () {
        return {
          joueur: null,
          carton: '',
          minuteCarton: null,
          remplacement: null,
          minuteRemplacement: null
        };
      }

      function remplacantVide () {
        return {
          joueur: null,
          carton: '',
          minuteCarton: null,
          minuteRemplacement: null
        };
      }

      $scope.prepareData = function () {
        // titulaires
        $scope.cfg.data.titulaires = [];
        for (var i=0; i<11; ++i) {
          $scope.cfg.data.titulaires.push(titulaireVide());
        }

        // remplacants
        $scope.cfg.data.remplacants = [];
        for (i=0; i<5; ++i) {
          $scope.cfg.data.remplacants.push(remplacantVide());
        }

        // classement
        $scope.cfg.data.classement = [];
        for (i=0; i<4; ++i) {
          $scope.cfg.data.classement.push({
            equipe: null,
            pts: null
          });
        }
      };

      $scope.changeButsOM = function () {
        $scope.cfg.data.buteursOM = [];
        for (var i=0; i<$scope.cfg.data.butsOM; ++i) {
          $scope.cfg.data.buteursOM.push({
            minute: null,
            minuteExtra: null,
            csc: false,
            joueur: null,
            nomCsc: '',
            penalty: false
          });
        }
      };

      $scope.changeButsAdv = function () {
        $scope.cfg.data.buteursAdv = [];
        for (var i=0; i<$scope.cfg.data.butsAdv; ++i) {
          $scope.cfg.data.buteursAdv.push({
            minute: null,
            minuteExtra: null,
            csc: false,
            nom: '',
            penalty: false
          });
        }
      };

      $scope.changeButsOM();
      $scope.changeButsAdv();
      $scope.prepareData();

      // pré-remplissage depuis la page du match : adresse, texte collé ou favori « Envoyer à LVDLOM »
      $scope.importPage = {
        url: '',
        texte: '',
        texteVisible: false,
        favoriVisible: false,
        enCours: false,
        erreur: null,
        source: null,
        avertissements: []
      };

      $scope.preRemplir = function (evt) {
        evt.preventDefault();
        var page = $scope.importPage;
        var texte = page.texteVisible ? page.texte : '';

        if (!page.url && !texte) {
          page.erreur = 'Indiquez l\'adresse de la page du match ou collez son texte.';
          return;
        }
        analyser({url: page.url, texte: texte});
      };

      // Entrée dans le champ d'adresse : pré-remplir, sans valider le formulaire du match
      $scope.toucheAdresse = function (evt) {
        if (evt.keyCode === 13) {
          $scope.preRemplir(evt);
        }
      };

      function analyser (contenu) {
        var page = $scope.importPage;
        page.enCours = true;
        page.erreur = null;
        page.source = null;
        page.avertissements = [];

        $http.post('services/match-import.php', contenu).success(function (res) {
          page.enCours = false;
          if (res.error) {
            page.erreur = res.error;
            return;
          }
          appliquer(res.data);
          page.source = res.source;
          page.avertissements = res.avertissements || [];
        }).error(function (res) {
          page.enCours = false;
          page.erreur = (res && res.error) ? res.error : 'L\'analyse de la page a échoué.';
        });
      }

      function parCle (liste, cle) {
        if (cle === null || cle === undefined) {
          return null;
        }
        return (liste || []).filter(function (item) {
          return String(item.key) === String(cle);
        })[0] || null;
      }

      // une valeur encore jamais saisie (un nouveau niveau…) doit exister dans sa liste pour s'afficher
      function ajouterOption (liste, valeur) {
        if (liste && valeur && !parCle(liste, valeur)) {
          liste.push({key: valeur, label: valeur});
        }
      }

      function avecJoueur (ligne) {
        return angular.extend({}, ligne, {joueur: parCle($scope.dictionary.joueurs, ligne.joueur)});
      }

      function appliquer (d) {
        var data = $scope.cfg.data;
        var date = d.date ? d.date.split('-') : null;

        ajouterOption($scope.dictionary.competitions, d.competition);
        ajouterOption($scope.dictionary.niveaux, d.niveau);

        data.saison = d.saison;
        data.date = date ? new Date(+date[0], +date[1] - 1, +date[2]) : null;
        data.lieu = d.lieu;
        data.competition = d.competition;
        data.niveau = d.niveau;
        data.adversaire = d.adversaire;
        data.spectateurs = d.spectateurs;

        data.butsOM = d.butsOM;
        data.butsAdv = d.butsAdv;
        data.rqScore = d.rqScore;
        data.tabOM = d.tabOM;
        data.tabAdv = d.tabAdv;
        data.buteursOM = d.buteursOM.map(avecJoueur);
        data.buteursAdv = d.buteursAdv;

        data.titulaires = d.titulaires.map(avecJoueur);
        while (data.titulaires.length < 11) {
          data.titulaires.push(titulaireVide());
        }
        data.remplacants = d.remplacants.map(avecJoueur);
        while (data.remplacants.length < 5) {
          data.remplacants.push(remplacantVide());
        }
        data.classement = d.classement;
      }

      if (PageEnvoyee.page) {
        $scope.importPage.url = PageEnvoyee.page.url || '';
        analyser(PageEnvoyee.page);
        PageEnvoyee.page = null;
      }

      // helpers
      $scope.setLastSaison = function (evt) {
        evt.preventDefault();
        $scope.cfg.data.saison = $scope.dictionary.saisons[0].key;
      };
      $scope.setStadeVel = function (evt) {
        evt.preventDefault();
        $scope.cfg.data.lieu = 'Orange Vélodrome';
      };
      $scope.setLigue1 = function (evt) {
        evt.preventDefault();
        $scope.cfg.data.competition = 'Ligue 1';
      };
      $scope.setNextJoueur = function (evt, selectedJoueur) {
        evt.preventDefault();
        for (var i=0; i<$scope.cfg.data.buteursOM.length; ++i) {
          var joueur = $scope.cfg.data.buteursOM[i];
          if (!joueur.joueur || !joueur.joueur.key) {
            joueur.joueur = selectedJoueur;
            return;
          }
        }
        for (i=0; i<$scope.cfg.data.titulaires.length; ++i) {
          joueur = $scope.cfg.data.titulaires[i];
          if (!joueur.joueur || !joueur.joueur.key) {
            joueur.joueur = selectedJoueur;
            return;
          }
        }
        for (i=0; i<$scope.cfg.data.remplacants.length; ++i) {
          joueur = $scope.cfg.data.remplacants[i];
          if (!joueur.joueur || !joueur.joueur.key) {
            joueur.joueur = selectedJoueur;
            return;
          }
        }
      };
    }
  };
});