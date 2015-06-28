(function () {
  
  'use strict';

  // API
  app.factory('Dirigeants', function ($resource) {
    return $resource('services/dirigeants.php', {}, {
      get: {method: 'GET', isArray: true, cache: true}
    });
  });
  
  // controller
  app.controller('DirigeantsCtrl', function($scope, $injector, Dirigeants, Formatter, Sorter, Filter) {
    
    $injector.invoke(AbstractListCtrl, this, {$scope: $scope});
    
    // filters
    $scope.filters = [
      Filter.periode,
      Filter.fonction   
    ];
    
    // data
    $scope.fetchData = function (filters) {
      return Dirigeants.get(filters);
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
        formatter: Formatter.nomDirigeant,
        sorter: Sorter.nom
      }, {
        title: 'Fonctions',
        formatter: Formatter.fonctions,
        sorter: Sorter.fonctions,
        key: 'fonctions'
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
        title: 'Joueur',
        formatter: Formatter.poste,
        sorter: Sorter.poste,
        key: 'poste'
      }, {
        title: 'Période',
        sorter: Sorter.periode,
        key: 'periode'
      }],
      defaultSort: 5,
      selected: $scope.selected,
      itemName: 'dirigeants'
    };
    
  });

}) ();
