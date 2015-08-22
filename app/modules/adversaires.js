(function () {
  
  'use strict';

  // API
  app.factory('Adversaires', function ($resource) {
    return $resource('services/adversaires.php', {}, {
      get: {method: 'GET', isArray: true, cache: false}
    });
  });
  
  // controller
  app.controller('AdversairesCtrl', function($scope, $injector, Adversaires, Formatter, Sorter, Filter, Bom) {
    
    $injector.invoke(AbstractListCtrl, this, {$scope: $scope});
    
    // filters
    $scope.filters = [
      Filter.periode,
      Filter.competition,
      Filter.lieu,
      Filter.jyEtais
    ];
    
    // data
    $scope.fetchData = function (filters) {
      return Adversaires.get(filters);
    };
    $scope.data.list = $scope.fetchData(Filter.toParams($scope.filters));
    
    // selection
    $scope.selectionTpl = 'app/directives/mini/miniadversaire.html';
    
    // table 
    $scope.tableCfg = {
      data: $scope.data,
      columns: [{
        title: 'Club',
        formatter: Formatter.club,
        sorter: Sorter.club
      }, {
        title: 'Pays',
        formatter: Formatter.flag,
        key: 'pays'
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
      defaultSort: 3,
      selected: $scope.selected,
      showRanking: true,
      itemName: 'adversaires'
    };
    
  });
  
}) ();
