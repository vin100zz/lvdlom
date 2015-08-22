(function () {
  
  'use strict';
  
  // API
  app.factory('Saisons', function ($resource) {
    return $resource('services/saisons.php', {}, {
      get: {method: 'GET', isArray: true, cache: false}
    });
  });
  
  // controller
  app.controller('SaisonsCtrl', function($scope, $injector, Saisons, Formatter, Sorter, Filter, Bom) {
    
    $injector.invoke(AbstractListCtrl, this, {$scope: $scope});
    
    // filters
    $scope.filters = [
      Filter.adversaire,
      Filter.competition,
      Filter.lieu,
      Filter.jyEtais
    ];
    
    // data
    $scope.fetchData = function (filters) {
      return Saisons.get(filters);
    };
    $scope.data.list = $scope.fetchData(Filter.toParams($scope.filters));
    
    // selection
    $scope.selectionTpl = 'app/directives/mini/minisaison.html';
    $scope.selectionLink = '#saison/';
    
    // table 
    $scope.tableCfg = {
      data: $scope.data,
      columns: [{
        title: 'Saison',
        formatter: Formatter.saison,
        key: 'id'
      }, {
        title: 'Joueurs',
        formatter: Formatter.int,
        sorter: Sorter.int,
        key: 'nbJoueurs'
      }, {
        title: 'Bilan',
        formatter: Formatter.bilanMatchesVictoires.bind(this, $scope.maxData),
        sorter: Sorter.bilan,
        defaultOrderDescending: true
      }, {
        title: 'M',
        formatter: Formatter.int,
        sorter: Sorter.int,
        key: 'nbMatches',
        defaultOrderDescending: true
      }, {
        title: 'V',
        formatter: Formatter.int,
        sorter: Sorter.int,
        key: 'nbVictoires',
        defaultOrderDescending: true
      }, {
        title: 'N',
        formatter: Formatter.int,
        sorter: Sorter.int,
        key: 'nbNuls',
        defaultOrderDescending: true
      }, {
        title: 'D',
        formatter: Formatter.int,
        sorter: Sorter.int,
        key: 'nbDefaites',
        defaultOrderDescending: true
      }, {
        title: 'BP',
        formatter: Formatter.int,
        sorter: Sorter.int,
        key: 'bp',
        defaultOrderDescending: true
      }, {
        title: 'BC',
        formatter: Formatter.int,
        sorter: Sorter.int,
        key: 'bc',
        defaultOrderDescending: true
      }, {
        title: 'Diff',
        formatter: Formatter.diff,
        sorter: Sorter.int,
        key: 'diff',
        defaultOrderDescending: true
      }, {
        title: 'Titres',
        formatter: Formatter.titres,
        key: 'titres',
        defaultOrderDescending: true
      }, {
        title: '2èmes Places',
        formatter: Formatter.titres,
        key: 'finales',
        defaultOrderDescending: true
      }],
      defaultSort: 0,
      selected: $scope.selected,
      itemName: 'saisons'
    };
  
  });

}) ();  