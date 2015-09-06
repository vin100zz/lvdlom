(function () {
  
  'use strict';
  
  // API
  app.factory('MatchesJoueur', function ($resource) {
    return $resource('services/matches-joueur.php', {}, {
      get: {method: 'GET', isArray: false, cache: false}
    });
  });
  
  // controller
  app.controller('MatchesJoueurCtrl', function($scope, $injector, $routeParams, Joueur, MatchesJoueur, Formatter) {

    // abstract
    $injector.invoke(AbstractModuleCtrl, this, {$scope: $scope, pageTitle: null});

    // template
    $scope.Formatter = Formatter;

    // joueur
    $scope.joueur = Joueur.get({id: $routeParams.id}, function (joueur) {
      $scope.setPageTitle(joueur.fiche.prenom + ' ' + joueur.fiche.nom + ' (matches)');
    });

    // matches
    MatchesJoueur.get({id: $routeParams.id}, function (data) {

      // harmonize match length
      var hasEverPlayedMatchWithProlongation = data.matches.some(function (match) {
        return !!match.rqScore;
      });

      $scope.matches = data.matches.map(function (match, index, matches) {
        var joue = data.joue[match.id];
        match.joue = !!joue;
        if (joue) {
          var barLength = hasEverPlayedMatchWithProlongation ? 125 : 95;
          var matchLength = match.rqScore ? 125 : 95;
          match.pcIn = Math.min(joue.minuteIn, barLength) / barLength * 100;
          match.pcOut = Math.min(joue.minuteOut || matchLength, barLength) / barLength * 100;
          match.buts = parseInt(data.buts[match.id], 10) || 0;
          match.carton = joue.carton;
        } else {
          match.pcIn = 0;
          match.pcOut = 0;
        }
        match.pcEnd = (match.rqScore || !hasEverPlayedMatchWithProlongation) ? 100 : (95 / 125 * 100);
        match.displaySaison = (index === 0 || matches[index-1].saison !== match.saison);
        return match;
      });

      
    });
   
  });

}) ();



