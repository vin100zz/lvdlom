(function () {
  
  'use strict';
  
  // API
  app.factory('Matches', function ($resource) {
    return $resource('services/matches.php', {}, {
      get: {method: 'GET', isArray: true, cache: false}
    });
  });
  
  // controller
  app.controller('MatchesCtrl', function($scope, $injector, Matches, Formatter, Sorter, Filter, Bom) {
    
    $injector.invoke(AbstractListCtrl, this, {$scope: $scope});
    
    // filters
    $scope.filters = [
      Filter.periode,
      Filter.saison,
      Filter.competition,
      Filter.lieu,
      Filter.adversaire,
      Filter.jyEtais
    ];
    
    // data
    $scope.fetchData = function (filters) {
      return Matches.get(filters);
    };
    $scope.data.list = $scope.fetchData(Filter.toParams($scope.filters));
    
    // selection
    $scope.selectionTpl = 'app/directives/mini/minimatch.html';
    $scope.selectionLink = '#match/';
    
    // table 
    $scope.tableCfg = {
      data: $scope.data,
      columns: [{
        title: 'Date',
        formatter: Formatter.date,
        key: 'date'
      }, {
        title: 'Compétition',
        formatter: Formatter.competitionNiveau,
        sorter: Sorter.competitionNiveau
      }, {
        title: 'Lieu',
        formatter: Formatter.lieu,      
        key: 'lieu'
      }, {
        title: 'Adversaire',
        formatter: Formatter.club,
        sorter: Sorter.club
      }, {
        title: 'Score',
        formatter: Formatter.score.bind(this, Formatter.$Score.table),
        sorter: Sorter.score,
        defaultOrderDescending: true
      }, {
        title: 'J\'y étais',
        key: 'jyEtais',
        defaultOrderDescending: true
      }],
      defaultSort: 0,
      selected: $scope.selected,
      itemName: 'matches'
    };
    
    // chart
    var computeTotalsVnd = function (list) {
      return list.reduce(function (result, current) {
        var resultat = Bom.resultat(current);
        if (resultat === Bom.$Resultat.victoire) {
          ++result[2];
        } else if (resultat === Bom.$Resultat.nul) {
          ++result[1];
        } else {
          ++result[0];
        }
        return result;
      }, [0, 0, 0]);
    };
    var totalsVnd = {value: computeTotalsVnd($scope.data.list)};
    
    var computeTotalsBpBc = function (list) {
      return list.reduce(function (result, current) {
        result[0] += parseInt(current.butsAdv, 10);
        result[1] += parseInt(current.butsOM, 10);
        return result;
      }, [0, 0]);
    };
    var totalsBpBc = {value: computeTotalsBpBc($scope.data.list)};
    
    $scope.$watch('data.list', function (newValue, oldValue) {
      if (newValue !== oldValue) {
        totalsVnd.value = computeTotalsVnd(newValue);
        totalsBpBc.value = computeTotalsBpBc(newValue);
      }
    }, true);
    
    $scope.chartCfg = {
      main: {
        data: totalsVnd,
        settings: [{
          color: '#e74c3c',
          label: 'D'
        }, {
          color: '#f39c12',
          label: 'N'
        }, {
          color: '#2ecc71',
          label: 'V'
        }]
      },
      inner: {
        data: totalsBpBc,
        settings: [{
          color: '#e74c3c',
          label: 'BC'
        }, {
          color: '#2ecc71',
          label: 'BP'
        }]
      }
    };
  });
  
}) ();  
