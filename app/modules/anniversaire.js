(function () {

  'use strict';

  // API
  app.factory('Day', function ($resource) {
    return $resource('services/date.php', {}, {
      get: {method: 'GET', isArray: false, cache: false}
    });
  });

  // controller
  app.controller('DayCtrl', function($scope, $injector, $routeParams, Day, Match, Joueur, Dirigeant, Bom, Formatter, DateTime, Picture) {

    $injector.invoke(AbstractModuleCtrl, this, {$scope: $scope, pageTitle: 'Anniversaires'});

    $scope.Formatter = Formatter;
    $scope.Bom = Bom;
    // écusson actuel de l'OM (la saison commence en juillet)
    var aujourdhui = new Date();
    var debutSaison = aujourdhui.getFullYear() - (aujourdhui.getMonth() < 6 ? 1 : 0);
    $scope.ecussonOm = Picture.club('OM', debutSaison + '-' + String(debutSaison + 1).substr(2));

    $scope.matches = [];
    $scope.joueurs = [];
    $scope.dirigeants = [];

    $scope.fiches = [];

    var attendus = 0;
    $scope.enCours = function () {
      return attendus > 0;
    };

    // carte d'un match : écussons des deux équipes et score, domicile à gauche
    var carteMatch = function (match) {
      var fiche = match.fiche;
      var domicile = Bom.domicile(fiche.lieu);
      var om = Picture.club('OM', fiche.saison), adv = Picture.club(match.adversaire.id);
      var initialesAdv = (match.adversaire.nom || '').substr(0, 1);
      return {
        titre: Formatter.matchTitle(match),
        gauche: domicile ? om : adv,
        droite: domicile ? adv : om,
        initialesGauche: domicile ? 'OM' : initialesAdv,
        initialesDroite: domicile ? initialesAdv : 'OM',
        score: Formatter.score(Formatter.$Score.big, fiche)
      };
    };

    // carte d'une personne : sa photo, ou ses initiales quand il n'y en a pas
    var cartePersonne = function (personne, photo) {
      var prenom = (personne.fiche.prenom || '').trim();
      var carte = {
        titre: (prenom ? prenom + ' ' : '') + personne.fiche.nom,
        photo: photo,
        photoOk: false,
        initiales: (prenom ? prenom[0] : '') + (personne.fiche.nom || '').substr(0, 1)
      };
      var img = new Image();
      img.onload = function () {
        carte.photoOk = true;
        $scope.$applyAsync();
      };
      img.src = photo;
      return carte;
    };

    var date = $routeParams.date || DateTime.format(new Date(), 'MM-dd');
    $scope.model = Day.get({date: date}, function () {

      // fetch data
      var fetchData = function (type, dateKey, factory, titleFn, dateFn, linkFn, carteFn) {
        $scope.model[type].forEach(function (raw) {
          ++attendus;
          factory.get({id: raw.id}, function (data) {
            --attendus;
            // réponse invalide du service (erreur PHP) : on ignore la carte
            if (!data || (!data.fiche && type !== 'matches') || (type === 'matches' && (!data.fiche || !data.adversaire))) {
              return;
            }

            $scope.fiches.push({
              type: type,
              data: data,
              title: titleFn(data),
              date: dateFn(data),
              link: linkFn(data),
              carte: carteFn(data)
            });

            $scope.fiches.sort(function (fiche1, fiche2) {
              return fiche1.date.localeCompare(fiche2.date);
            });

          }, function () {
            --attendus;
          });
        });
      };

      fetchData('matches', 'date', Match,
                Formatter.matchTitle,
                function (match) {return match.fiche.date;},
                function (match) {return '#match/' + match.id;},
                carteMatch);

      fetchData('joueurs', 'dateNaissance', Joueur,
                function (joueur) {return joueur.fiche.prenom + ' ' + joueur.fiche.nom;},
                function (joueur) {return joueur.fiche.dateNaissance;},
                function (joueur) {return '#joueur/' + joueur.id;},
                function (joueur) {return cartePersonne(joueur, Picture.joueur(joueur.id));});

      fetchData('dirigeants', 'dateNaissance', Dirigeant,
                function (dirigeant) {return dirigeant.fiche.prenom + ' ' + dirigeant.fiche.nom;},
                function (dirigeant) {return dirigeant.fiche.dateNaissance;},
                function (dirigeant) {return '#dirigeant/' + dirigeant.id;},
                function (dirigeant) {return cartePersonne(dirigeant, Picture.dirigeant(dirigeant.id));});

      // breadcrumb
      var month = parseInt($scope.model.date.substr(0, 2), 10);
      var day = parseInt($scope.model.date.substr(3, 2), 10);
      var date = new Date(new Date().getFullYear(), month-1, day);

      var prev = new Date(date.getTime() - 1000 * 60 * 60 * 24);
      var next = new Date(date.getTime() + 1000 * 60 * 60 * 24);

      $scope.currentDay = DateTime.format(date, 'd');
      $scope.currentMonth = DateTime.format(date, 'MMMM');

      $scope.breadcrumb = {
        prev: {
          label: DateTime.format(prev, 'd MMMM'),
          link: '#/anniversaire/' + DateTime.format(prev, 'MM-dd')
        },
        next: {
          label: DateTime.format(next, 'd MMMM'),
          link: '#/anniversaire/' + DateTime.format(next, 'MM-dd')
        }
      };
    });
  });

}) ();
