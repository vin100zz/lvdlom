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

              // reformat prêts
              var pret = /prêt à (.*)/.exec(row.club);
              if (pret && pret.length > 0) {
                row.club = pret[1];
                row.remark = 'prêt';
              }
              pret = /prêt (.*)/.exec(row.club);
              if (pret && pret.length > 0) {
                row.club = pret[1];
                row.remark = 'prêt';
              }

              // remove dates
              row.club = row.club.replace(/(.*)\(\d+\w* \w+ \d+\)(.*)/, '$1$2');

              // trim
              row.club = row.club.trim();

              // reformat OM
              if (row.club === 'Marseille' || row.club === 'Marseille (prêt)') {
                row.club = 'OM';
              }
              if (row.club === 'Marseille (réserve)') {
                row.club = 'OM';
                row.remark = 'réserve';
              }

              row.om = row.club.substr(0, 2) === 'OM';

              return row;
            })
            .reduce(function (array, current) {
              if (array.length === 0 || array[array.length-1].club !== current.club || current.remark) {
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