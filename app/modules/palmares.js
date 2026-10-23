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
    
    $scope.chartCfg = [
      {title: 'Championnat', sousTitre: 'classement final', titreGagne: 'Champion', height: 800},
      {title: 'Coupes d\'Europe', sousTitre: 'tour atteint', titreGagne: 'Vainqueur', height: 340},
      {title: 'Coupe de France', sousTitre: 'tour atteint', titreGagne: 'Vainqueur', height: 340},
      {title: 'Autres coupes nationales', sousTitre: 'tour atteint', titreGagne: 'Vainqueur', height: 340}
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
          hauteur: cfg.height,
          niveaux: chartData.niveaux,
          competitions: chartData.competitions
        };
      });
    });
  });
  
}) ();
