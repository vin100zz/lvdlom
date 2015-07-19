
(function () {
  
  'use strict';
  
  // API
  app.factory('Avancement', function ($resource) {
    return $resource('services/avancement.php', {}, {
      get: {method: 'GET', isArray: false, cache: true}
    });
  });
  
  // controller
  app.controller('AvancementCtrl', function($scope, $routeParams, Avancement) {
    
    $scope.matches = {};
    $scope.nbMatchesDone = 0;
    $scope.nbMatchesTotal = 0;

    $scope.joueurs = {};
    $scope.nbJoueursDone = 0;
    $scope.nbJoueursTotal = 0;

    var getChartCfg = function (nbDone, nbTotal, colorDone, colorNotDone) {
      return {
        main: {
          data: {value: [nbTotal-nbDone, nbDone]},
          settings: [{color: colorNotDone}, {color: colorDone}],
          chartjsCfg: {
            percentageInnerCutout: 75,
            segmentStrokeWidth: 1
          }
        },
        hideLegend: true
      };
    };

    Avancement.get(null, function (data) {
      // matches
      $scope.nbMatchesTotal = data.matches.length;
      data.matches.forEach(function (match) {
        ($scope.matches[match.saison] = $scope.matches[match.saison] || []).push(match);
        $scope.nbMatchesDone += (match.nbDocs > 0 ? 1 : 0);
      });
      $scope.matchesChartCfg = getChartCfg($scope.nbMatchesDone, $scope.nbMatchesTotal, '#009688', '#E0F2F1');

      // joueurs
      $scope.nbJoueursTotal = data.joueurs.length;
      data.joueurs.forEach(function (joueur) {
        ($scope.joueurs[joueur.nom.substr(0,1)] = $scope.joueurs[joueur.nom.substr(0,1)] || []).push(joueur);
        $scope.nbJoueursDone += (joueur.nbDocs > 0 ? 1 : 0);
      });
      $scope.joueursChartCfg = getChartCfg($scope.nbJoueursDone, $scope.nbJoueursTotal, '#673AB7', '#EDE7F6');

    });

  });
  
}) ();