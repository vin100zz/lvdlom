(function () {
  
  'use strict';
  
  // API
  app.factory('EquipeTypes', function ($resource) {
    return $resource('services/equipe-types.php', {}, {
      get: {method: 'GET', isArray: true, cache: true}
    });
  });
  
  // controller
  app.controller('EquipeTypesCtrl', function($scope, $routeParams, EquipeTypes, Sorter) {
    
    $scope.saisons = [];

    EquipeTypes.get(null, function (saisons) {
      
      $scope.saisons = saisons.map(function (saison) {
        var res = {};
        res.id = saison.id;
        
        res.joueurs = saison.joueurs
        .sort(function (joueur1, joueur2) {
          return parseInt(joueur2.nbMatches, 10) - parseInt(joueur1.nbMatches, 10);
        })
        .slice(0, 11)
        .sort(function (joueur1, joueur2) {
          return Sorter.poste(joueur1.poste) - Sorter.poste(joueur2.poste);
        })
        .map(function (joueur) {
          var nbButs = 0;
          if (saison.buteurs) {
            var buteur = saison.buteurs.find(function (buteur) {
              return buteur.id === joueur.id;
            }) || {};
            nbButs = buteur.nbButs || 0;
          }
          joueur.nbButs = nbButs;
          return joueur;
        });
        
        return res;
      });
 
    });
  });
  
}) ();