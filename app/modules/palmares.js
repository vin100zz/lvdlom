(function () {
  
  'use strict';
  
  // API
  app.factory('Palmares', function ($resource) {
    return $resource('services/palmares.php', {}, {
      get: {method: 'GET', isArray: true, cache: false}
    });
  });
  
  // controller
  app.controller('PalmaresCtrl', function($scope, $injector, $routeParams, Palmares) {

    $injector.invoke(AbstractModuleCtrl, this, {$scope: $scope, pageTitle: 'Palmarès'});
    
    // le graphique du championnat tient dans l'écran, sous le titre de la page
    var hauteurChampionnat = Math.max(420, Math.min(800, window.innerHeight - 200));

    $scope.chartCfg = [
      {title: 'Championnat', titreGagne: 'Champion', height: hauteurChampionnat},
      {title: 'Coupes d\'Europe', titreGagne: 'Vainqueur', height: 300},
      {title: 'Coupe de France', titreGagne: 'Vainqueur', height: 300},
      {title: 'Autres coupes nationales', titreGagne: 'Vainqueur', height: 300}
    ];
    
    Palmares.get(null, function (chartsData) {
      chartsData.forEach(function (chartData, index) {
        var cfg = $scope.chartCfg[index];
        if (!cfg) {
          return;
        }
        cfg.data = {
          titre: cfg.title,
          titreGagne: cfg.titreGagne,
          legendeExterne: true,
          hauteur: cfg.height,
          niveaux: chartData.niveaux,
          competitions: chartData.competitions
        };
      });
    });
  });
  
}) ();
