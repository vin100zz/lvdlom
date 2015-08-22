
(function () {
  
  'use strict';
  
  // API
  app.factory('Avancement', function ($resource) {
    return $resource('services/avancement.php', {}, {
      get: {method: 'GET', isArray: false, cache: false}
    });
  });
  
  // controller
  app.controller('AvancementCtrl', function($scope, $routeParams, Avancement) {
    
    $scope.avancements = [];

    $scope.currentView = null;

    $scope.switchView = function (view) {
      $scope.currentView = view;
    };

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

    var computeAvancement = function (order, type, items, idItems, icon, title, link, colorDone, colorNotDone, keyFn, keyDisplayFn, tooltipFn) {
      var avancement = {};
      avancement.showIdData = !!idItems;
      avancement.nbTotal = items.length;
      avancement.nbDone = 0;
      avancement.nbIdDone = 0;
      avancement.groups = {};
      avancement.color = colorDone;
      avancement.icon = icon;
      avancement.title = title;
      avancement.link = link;
      avancement.keyDisplayFn = keyDisplayFn;
      
      items.forEach(function (item) {
        item.tooltip = tooltipFn(item);
        
        var key = keyFn(item, avancement.groups);
        (avancement.groups[key] = avancement.groups[key] || []).push(item);

        // docs        
        avancement.nbDone += (item.nbDocs > 0 ? 1 : 0);

        // ids
        if (idItems) {
          item.hasIdDoc = !!idItems.find(function (idItem) {
            return idItem === item.id + '.jpg';
          });
          avancement.nbIdDone += (item.hasIdDoc > 0 ? 1 : 0);
        }
      });

      avancement.chartCfg = getChartCfg(avancement.nbDone, avancement.nbTotal, colorDone, colorNotDone);
      avancement.idChartCfg = getChartCfg(avancement.nbIdDone, avancement.nbTotal, colorDone, colorNotDone);

      $scope.avancements.push(avancement);
      $scope.avancements.sort(function (avancement1, avancement2) {return avancement2.order - avancement1.order;});
    };

    Avancement.get(null, function (data) {
      // matches
      computeAvancement(1, 'matches', data.matches, null, 'futbol-o', 'Matches', 'match', '#009688', '#E0F2F1',
                        function (match) {return match.saison;},
                        function (key) {return key;},
                        function (match) {return match.adversaire + ' ' + match.butsOM + '-' + match.butsAdv;});

      // joueurs
      computeAvancement(2, 'joueurs', data.joueurs, data.idJoueurs, 'user', 'Joueurs', 'joueur', '#673AB7', '#EDE7F6',
                        function (joueur, groups) {var initiale = joueur.nom.substr(0,1); return (groups[initiale] || []).length > 50 ? initiale + 'bis' : initiale;},
                        function (key) {return key.length === 1 ? key : '';},
                        function (joueur) {return joueur.prenom + ' ' + joueur.nom;});

      // dirigeants
      computeAvancement(3, 'dirigeants', data.dirigeants, data.idDirigeants, 'briefcase', 'Dirigeants', 'dirigeant', '#FF9800', '#FFF3E0',
                        function (dirigeant, groups) {var initiale = dirigeant.nom.substr(0,1); return (groups[initiale] || []).length > 50 ? initiale + 'bis' : initiale;},
                        function (key) {return key.length === 1 ? key : '';},
                        function (dirigeant) {return dirigeant.prenom + ' ' + dirigeant.nom;});

      // saisons
      computeAvancement(4, 'saisons', data.saisons, data.idSaisons, 'history', 'Saisons', 'saison', '#4CAF50', '#E8F5E9',
                        function (saison, groups) {return (groups['saisons'] || []).length > 50 ? 'saisonsbis' : 'saisons';},
                        function (key) {return '';},
                        function (saison) {return saison.id;});

    });

  });
  
}) ();