(function () {
  
  'use strict';
  
  // API
  app.factory('Competitions', function ($resource) {
    return $resource('services/competitions.php', {}, {
      get: {method: 'GET', isArray: true, cache: true}
    });
  });
  
  // controller
  app.controller('CompetitionsCtrl', function($scope, $injector, Competitions, Formatter, Sorter, Filter, Bom) {
    
    $injector.invoke(AbstractListCtrl, this, {$scope: $scope});
    
    // filters
    $scope.filters = [
      Filter.jyEtais
    ];
    
    // data
    $scope.fetchData = function (filters) {
      return Competitions.get(filters);
    };
    $scope.data.list = $scope.fetchData(Filter.toParams($scope.filters));
    
    // selection
    $scope.selectionTpl = 'app/modules/minijoueur.html';
    
    // table 
    $scope.tableCfg = {
      data: $scope.data,
      columns: [{
        title: 'Compétition',
        formatter: Formatter.competition,
        sorter: Sorter.competition
      }, {
        title: 'Saisons',
        formatter: Formatter.int,
        sorter: Sorter.int,
        key: 'nbSaisons',
        defaultOrderDescending: true
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
      }],
      defaultSort: 2,
      selected: $scope.selected,
      itemName: 'compétitions'
    };
  
  });

}) ();