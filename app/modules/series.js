(function () {
  
  'use strict';
  
  // API
  app.factory('Series', function ($resource) {
    return $resource('services/series.php', {}, {
      get: {method: 'GET', isArray: false, cache: true}
    });
  });
  
  // controller
  app.controller('SeriesCtrl', function($scope, $routeParams, Series, Filter, Loading, Formatter) {
    $scope.Formatter = Formatter;

    $scope.metaData = [
      {key: 'victoire', label: 'Série de victoires'},
      {key: 'nonDefaite', label: 'Série de matches sans défaite'},
      {key: 'defaite', label: 'Série de défaites'},
      {key: 'nonVictoire', label: 'Série de matches sans victoire'},
      {key: 'butMarque', label: 'Série de matches en marquant un but'},
      {key: 'sansEncaisser', label: 'Série de matches sans encaisser de but'},
      {key: 'sansMarquer', label: 'Série de matches sans marquer de but'},
      {key: 'butEncaisse', label: 'Série de matches en encaissant un but'}
    ];

    // filters
    $scope.filters = [
      Filter.periode,
      Filter.competition,
      Filter.lieu,
      Filter.adversaire,
      Filter.jyEtais
    ];

    // data
    $scope.series = Series.get(Filter.toParams($scope.filters));

    // filters change
    $scope.$watch('filters', function (newValue, oldValue) {
      if (newValue !== oldValue) {
        Loading.silent();
        var filtersUpdated = Filter.updated(newValue, oldValue);
        if (filtersUpdated) {
          $scope.series = Series.get(filtersUpdated);
        }
      }
    }, true);
  });
  
}) ();