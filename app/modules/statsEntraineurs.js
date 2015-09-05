(function () {
  
  'use strict';
  
  // API
  app.factory('StatsEntraineurs', function ($resource) {
    return $resource('services/stats-entraineurs.php', {}, {
      get: {method: 'GET', isArray: true, cache: false}
    });
  });
  
  // controller
  app.controller('StatsEntraineursCtrl', function($scope, $injector, StatsEntraineurs, Formatter, Sorter, Filter) {
    
    $injector.invoke(AbstractListCtrl, this, {$scope: $scope, pageTitle: 'Stats Entraîneurs'});
    
    // filters
    $scope.filters = [
      Filter.periode() 
    ];
    
    // data  
    $scope.fetchData = function (filters) {
      return StatsEntraineurs.get(filters);
    };
    $scope.data.list = $scope.fetchData(Filter.toParams($scope.filters));
    
    // selection
    $scope.selectionTpl = 'app/directives/mini/minidirigeant.html';
    $scope.selectionLink = '#dirigeant/';
  
    // table
    $scope.tableCfg = {
      data: $scope.data,
      columns: [{
        title: 'Nom',
        formatter: Formatter.nomJoueur,
        sorter: Sorter.nom
      }, {
        title: 'Période',
        sorter: Sorter.periode,
        key: 'periode'
      }, {
        title: 'Saisons',
        sorter: Sorter.int,
        key: 'nbSaisons',
        defaultOrderDescending: true
      }, {
        title: 'Bilan',
        formatter: Formatter.bilanMatchesVictoires.bind(this, $scope.maxData),
        sorter: Sorter.bilanMatchesVictoires,
        defaultOrderDescending: true
      }, {
        title: 'Matches',
        formatter: Formatter.int,
        sorter: Sorter.int,
        key: 'nbMatches',
        defaultOrderDescending: true
      }, {
        title: 'Victoires',
        formatter: Formatter.int,
        sorter: Sorter.int,
        key: 'nbVictoires',
        defaultOrderDescending: true
      }, {
        title: 'Titres',
        formatter: Formatter.titres,
        key: 'titres',
        defaultOrderDescending: true
      }],
      defaultSort: 4,
      selected: $scope.selected,
      showRanking: true,
      itemName: 'entraîneurs'
    };
    
  });

}) ();  