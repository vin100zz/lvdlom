(function () {
  
  'use strict';
  
  // API
  app.factory('StatsJoueurs', function ($resource) {
    return $resource('services/stats-joueurs.php', {}, {
      get: {method: 'GET', isArray: true, cache: false}
    });
  });
  
  // controller
  app.controller('StatsJoueursCtrl', function($scope, $injector, StatsJoueurs, Formatter, Sorter, Filter) {
    
    $injector.invoke(AbstractListCtrl, this, {$scope: $scope, pageTitle: 'Stats Joueurs'});
    
    // filters
    $scope.filters = [
      Filter.poste,
      Filter.nationalite,
      Filter.lieuNaissance,
      Filter.formeAuClub,
      Filter.auClub   
    ];
    
    // data  
    $scope.fetchData = function (filters) {
      return StatsJoueurs.get(filters);
    };
    $scope.data.list = $scope.fetchData(Filter.toParams($scope.filters));
    
    // selection
    $scope.selectionTpl = 'app/directives/mini/minijoueur.html';
    $scope.selectionLink = '#joueur/';
  
    // table
    $scope.tableCfg = {
      data: $scope.data,
      columns: [{
        title: 'Nom',
        formatter: Formatter.nomJoueur,
        sorter: Sorter.nom
      }, {
        title: 'Poste',
        formatter: Formatter.poste,
        sorter: Sorter.poste,
        key: 'poste'
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
        formatter: Formatter.bilanMatchesButs.bind(this, $scope.maxData),
        sorter: Sorter.bilanMatchesButs,
        defaultOrderDescending: true
      }, {
        title: 'Matches',
        formatter: Formatter.int,
        sorter: Sorter.int,
        key: 'nbMatches',
        defaultOrderDescending: true
      }, {
        title: 'Buts',
        formatter: Formatter.int,
        sorter: Sorter.int,
        key: 'nbButs',
        defaultOrderDescending: true
      }, {
        title: 'Titres',
        formatter: Formatter.titres,
        key: 'titres',
        defaultOrderDescending: true
      }],
      defaultSort: 5,
      selected: $scope.selected,
      showRanking: true,
      itemName: 'joueurs'
    };
    
  });

}) ();  