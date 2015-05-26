(function () {
  
  'use strict';

  // API
  app.factory('Joueurs', function ($resource) {
    return $resource('services/joueurs.php', {}, {
      get: {method: 'GET', isArray: true, cache: true}
    });
  });
  
  // controller
  app.controller('JoueursCtrl', function($scope, $injector, Joueurs, Formatter, Sorter, Filter) {
    
    $injector.invoke(AbstractListCtrl, this, {$scope: $scope});
    
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
      return Joueurs.get(filters);
    };
    $scope.data.list = $scope.fetchData(Filter.toParams($scope.filters));
    
    // selection
    $scope.selectionTpl = 'app/modules/mini/minijoueur.html';
    
    // table 
    $scope.tableCfg = {
      data: $scope.data,
      columns: [{
        title: 'Nom',
        formatter: Formatter.nom,
        sorter: Sorter.nom
      }, {
        title: 'Poste',
        formatter: Formatter.poste,
        sorter: Sorter.poste,
        key: 'poste'
      }, {
        title: 'Nationalité',
        formatter: Formatter.flag,
        key: 'nationalite'
      }, {
        title: 'Date Naissance',
        formatter: Formatter.dateNaissance,
        key: 'dateNaissance',
        defaultOrderDescending: true
      }, {
        title: 'Lieu Naissance',
        formatter: Formatter.lieuNaissance,
        sorter: Sorter.lieuNaissance
      }, {
        title: 'Période',
        sorter: Sorter.periode,
        key: 'periode'
      }],
      defaultSort: 1,
      selected: $scope.selected,
      itemName: 'joueurs'
    };
    
  });

}) ();
