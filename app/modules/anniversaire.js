
(function () {
  
  'use strict';
  
  // API
  app.factory('Day', function ($resource) {
    return $resource('services/date.php', {}, {
      get: {method: 'GET', isArray: false, cache: false}
    });
  });
  
  // controller
  app.controller('DayCtrl', function($scope, $injector, $routeParams, Day, Match, Joueur, Dirigeant, Bom, Formatter, DateTime) {

    $injector.invoke(AbstractModuleCtrl, this, {$scope: $scope, pageTitle: 'Anniversaires'});

    $scope.Formatter = Formatter;
    $scope.Bom = Bom;
    
    $scope.matches = [];
    $scope.joueurs = [];
    $scope.dirigeants = [];

    $scope.fiches = [];
    
    var date = $routeParams.date || DateTime.format(new Date(), 'MM-dd');
    $scope.model = Day.get({date: date}, function () {
      
      // fetch data
      var fetchData = function (type, dateKey, factory, titleFn, dateFn, linkFn) {
        $scope.model[type].forEach(function (raw) {
          factory.get({id: raw.id}, function (data) {

            $scope.fiches.push({
              type: type,
              data: data,
              title: titleFn(data),
              date: dateFn(data),
              link: linkFn(data)
            });

            $scope.fiches.sort(function (fiche1, fiche2) {
              return fiche1.date.localeCompare(fiche2.date);
            });

          });        
        });
      };
      
      fetchData('matches', 'date', Match,
                Formatter.matchTitle,
                function (match) {return match.fiche.date;},
                function (match) {return '#match/' + match.id;});

      fetchData('joueurs', 'dateNaissance', Joueur,
                function (joueur) {return joueur.fiche.prenom + ' ' + joueur.fiche.nom;},
                function (joueur) {return joueur.fiche.dateNaissance;},
                function (joueur) {return '#joueur/' + joueur.id;});

      fetchData('dirigeants', 'dateNaissance', Dirigeant,
                function (dirigeant) {return dirigeant.fiche.prenom + ' ' + dirigeant.fiche.nom;},
                function (dirigeant) {return dirigeant.fiche.dateNaissance;},
                function (dirigeant) {return '#dirigeant/' + dirigeant.id;});
      
      // breadcrumb
      var month = parseInt($scope.model.date.substr(0, 2), 10);
      var day = parseInt($scope.model.date.substr(3, 2), 10);
      var date = new Date(new Date().getFullYear(), month-1, day);
  
      var prev = new Date(date.getTime() - 1000 * 60 * 60 * 24);
      var next = new Date(date.getTime() + 1000 * 60 * 60 * 24);
      
      $scope.current = DateTime.format(date, 'd MMMM');
      
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