// API
app.factory('Carriere', function ($resource) {
  return $resource('tools/om1899/mapping.json', {}, {
    get: {method: 'GET', isArray: false, cache: true}
  });
});
  
app.directive('lvdlomCarriereJoueur', function (Carriere) {
  return {
    scope: {
      joueur: '='
    },
    templateUrl: 'app/directives/joueur/carriere.html',
    controller: function ($scope) {

      $scope.carrieres = Carriere.get(null, function () {
          
        // render
        var render = function () {
          if (!$scope.joueur) {
            return;
          }
          
          $scope.carriere = null;
          var found = $scope.carrieres[$scope.joueur.id];
          if (found) {            
            $scope.carriere = JSON.parse(JSON.stringify(found)).carriere
            .filter(function (row) {
              return !!row.club;
            })
            .map(function (row) {
              row.saison = row.saison.substr(0, 4) + '-' + row.saison.substr(7, 2);
              row.club = row.club === 'Marseille' ? 'OM' : row.club;
              row.om = (row.club === 'OM');
              return row;
            })
            .reduce(function (array, current) {
              if (array.length === 0 || array[array.length-1].club !== current.club) {
                array.push(current);
              } else {
                array[array.length-1].saison = array[array.length-1].saison.substr(0, 5) + current.saison.substr(5, 2);
              }
              return array;
            }, []);
          }
        };
        
        render();
        
        // watch
        $scope.$watch('joueur', function (newValue, oldValue) {
          if (newValue !== oldValue) {
            render();
          }
        }, true);
      });
      
    }
  };
});