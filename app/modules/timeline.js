(function () {
  
  'use strict';
  
  // controller
  app.controller('TimelineCtrl', function($scope, $injector, $routeParams, EquipeTypes, Palmares, Formatter) {

    $injector.invoke(AbstractModuleCtrl, this, {$scope: $scope, pageTitle: 'Timeline'});

    $scope.Formatter = Formatter;
    
    $scope.saisons = [];
    $scope.personnes = [];
    $scope.palmares = {championnat: [], coupeFrance: [], coupeEurope: []};

    var FIRST_SAISON = "1923-24";

    var X_OFFSET = 120;
    var Y_OFFSET = 230;

    var SAISON_WIDTH = 100;
    var COLORS = {GA: '#3f51b5', DE: '#009688', MI: '#ff9800', AV: '#e91e63', EN: '#457596', PR: '#333'};
    var BACKGROUND_COLORS = {GA: 'white', DE: 'white', MI: 'white', AV: 'white', EN: '#BCD2E0', PR: '#BCD2E0'};

    var BLOCK_X_MARGIN = 3;
    var BLOCK_Y_MARGIN = 10;
    var BLOCK_HEIGHT = 55;

    var PALMARES_LABELS = {
      championnat: function (niveau) {
        if (!niveau) {return null;}
        if (niveau === 1) {return {label: '1er', niveau: 1};}
        if (niveau === 2) {return {label: '2e', niveau: 2};}
        if (niveau <= 20) {return {label: niveau + 'e'};}
        return {label: (niveau-20) + 'e D2', niveau: 'D2'};
      },
      coupeFrance : function (niveau) {
        if (!niveau) {return null};
        return {
          label: ['V', 'F', '1/2', '1/4', '1/8', '1/16', '1/32', '6e T'][niveau-1],
          niveau: niveau <= 2 ? niveau : null
        };
      },
      coupeEurope : function (niveau) {
        if (!niveau) {return null};
        return {
          label: ['V', 'F', '1/2', '1/4', '1/8', 'Grp', '1/16', '1/32', '1er T'][niveau-1],
          niveau: niveau <= 2 ? niveau : null
        };
      }
    };

    var computeNbSaisons = function (saisonStart, saisonEnd) {
      return parseInt(saisonEnd.substr(0, 4), 10) - parseInt(saisonStart.substr(0, 4), 10);
    };

    var buildTimeline = function (joueurs, filterFn, poste, offset) {
      var rows = [];

      joueurs = joueurs
      .filter(filterFn)
      .map(joueur => {
        var rowIndex = 0;
        while (rowIndex < rows.length) {
          if (joueur.firstSaison > rows[rowIndex].lastSaison) {
            break;
          }
          ++rowIndex;
        }
        if (rowIndex >= rows.length) {
          rows.push({lastSaison: joueur.lastSaison});
        } else {
          rows[rowIndex].lastSaison = joueur.lastSaison;
        }

        joueur.style = {
          left: (computeNbSaisons(FIRST_SAISON, joueur.firstSaison)*SAISON_WIDTH + BLOCK_X_MARGIN + X_OFFSET) + 'px',
          width: ((computeNbSaisons(joueur.firstSaison, joueur.lastSaison)+1)*SAISON_WIDTH - 2*BLOCK_X_MARGIN) + 'px',
          top: ((offset.firstRow + rowIndex)*(BLOCK_HEIGHT+BLOCK_Y_MARGIN) + Y_OFFSET)+ 'px',
          height: BLOCK_HEIGHT + 'px',
          'border-color': COLORS[poste],
          'background-color': BACKGROUND_COLORS[poste]
        };

        joueur.stats = Object.values(joueur.stats).map((stat, index) => {
          return {
            value: stat,
            style: {
              left: (index*SAISON_WIDTH - BLOCK_X_MARGIN) + 'px'
            }
          };
        });

        return joueur;
      });

      offset.firstRow += rows.length;

      return joueurs;
    };

    var buildPalmares = function (data, index, holder) {
      data[index].competitions.forEach(competition => {
        Object.keys(competition.Histo).forEach(saison => {
          $scope.palmares[holder][saison] = $scope.palmares[holder][saison] || PALMARES_LABELS[holder](competition.Histo[saison].Niveau);
        });
      });
    };

    // Palmarès
    Palmares.get(null, function (data) {      
      buildPalmares(data, 0, 'championnat');
      buildPalmares(data, 1, 'coupeEurope');
      buildPalmares(data, 2, 'coupeFrance');
    });

    // Equipe-types
    EquipeTypes.get(null, function (saisons) {
      $scope.saisons = saisons.filter(saison => saison.id >= FIRST_SAISON);

      var previousSaison = null;
      var titulaires = [];
      var dirigeants = [];

      $scope.saisons.forEach(saison => {
        saison.joueurs
        .sort((joueur1, joueur2) => (parseInt(joueur2.nbTit, 10) || 0) - (parseInt(joueur1.nbTit, 10) || 0))
        .slice(0, 15)
        .forEach(joueur => {
          var knownJoueur = titulaires.find(j => j.id === joueur.id && (j.lastSaison === previousSaison || j.lastSaison === saison.id));
          if (!knownJoueur) {
            titulaires.push(joueur);
            titulaires[titulaires.length-1].firstSaison = saison.id;
            titulaires[titulaires.length-1].stats = {};
            knownJoueur = titulaires[titulaires.length-1];
          }
          knownJoueur.lastSaison = saison.id;
          knownJoueur.stats[saison.id] = joueur.nbMatches + ' m';

          var nbButs = 0;
          if (saison.buteurs) {
            var buteur = saison.buteurs.find(function (buteur) {
              return buteur.id === knownJoueur.id;
            }) || {};
            nbButs = buteur.nbButs || 0;
          }
          if (nbButs > 0) {
            knownJoueur.stats[saison.id] += ' |  ' + nbButs + ' b';
          }
        });

        saison.dirigeants
        .filter(dirigeant => ['1', '2', '5', '6', '7', '8', '10', '12'].includes(dirigeant.idFonction))
        .forEach(dirigeant => {
          var knownDirigeant = dirigeants.find(d => d.id === dirigeant.id && (d.lastSaison === previousSaison || d.lastSaison === saison.id));
          if (!knownDirigeant) {
            dirigeants.push(dirigeant);
            dirigeants[dirigeants.length-1].firstSaison = saison.id;
            dirigeants[dirigeants.length-1].stats = {};
            knownDirigeant = dirigeants[dirigeants.length-1];
          }
          knownDirigeant.lastSaison = saison.id;        
        });

        previousSaison = saison.id;
      });

      titulaires = titulaires
                    .sort((joueur1, joueur2) => {
                      if (joueur1.firstSaison !== joueur2.firstSaison) {
                        return joueur1.firstSaison - joueur2.firstSaison;
                      } 
                      return joueur1.id - joueur2.id;
                    });

      var offest = {firstRow: 0};
      $scope.personnes = buildTimeline(titulaires, (joueur) => joueur.poste === 'GA', 'GA', offest)
                       .concat(buildTimeline(titulaires, (joueur) => joueur.poste === 'DE', 'DE', offest))
                       .concat(buildTimeline(titulaires, (joueur) => joueur.poste === 'MI', 'MI', offest))
                       .concat(buildTimeline(titulaires, (joueur) => joueur.poste === 'AV', 'AV', offest))
                       .concat(buildTimeline(dirigeants, (dirigeant) => ['1'].includes(dirigeant.idFonction), 'EN', offest))
                       .concat(buildTimeline(dirigeants, (dirigeant) => ['2', '5', '6', '7', '8', '10', '12'].includes(dirigeant.idFonction), 'PR', offest));

    });
  });
  
}) ();