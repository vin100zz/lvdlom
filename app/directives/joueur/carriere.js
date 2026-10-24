// API
app.factory('Carriere', function ($resource) {
  return $resource('tools/om1899/mapping.json', {}, {
    get: {method: 'GET', isArray: false, cache: false}
  });
});
  
app.directive('lvdlomCarriereJoueur', function (Carriere, Picture) {
  return {
    scope: {
      joueur: '='
    },
    templateUrl: 'app/directives/joueur/carriere.html',
    controller: function ($scope) {

      $scope.ecussonOm = function (saison) {
        return Picture.club('OM', saison);
      };

      $scope.carrieres = Carriere.get(null, function () {
          
        // render
        var render = function () {
          if (!$scope.joueur) {
            return;
          }
          
          $scope.carriere = null;
          var found = $scope.carrieres[$scope.joueur.id];
          if (found) {            
            // Preserve every source row in OM1899 order, including successive loans/transfers.
            $scope.carriere = JSON.parse(JSON.stringify(found)).carriere
            .filter(function (row) {
              return !!row.club;
            })
            .map(function (row) {
              row.saison = row.saison.substr(0, 4) + '-' + row.saison.substr(7, 2);

              // Remove transfer dates, preserving other notes such as "réserve".
              var date = '(?:\\b\\d{4}[-/.]\\d{1,2}[-/.]\\d{1,2}\\b|\\b\\d{1,2}(?:er)?(?:\\s*[/.-]\\s*\\d{1,2}\\s*[/.-]\\s*\\d{2,4}|\\s+(?:janvier|f[ée]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[ée]cembre)\\s+\\d{4})\\b)';
              row.club = row.club
                .replace(new RegExp('\\(\\s*(?:(?:jusqu[’\x27]au|depuis(?: le)?|le)\\s+)?' + date + '\\s*\\)?', 'gi'), '')
                .replace(new RegExp(date, 'gi'), '')
                .replace(/\(\s*\)/g, '')
                .replace(/\s+[-–—]\s*$|\s*[-–—]\s+$/g, '')
                .replace(/\s+/g, ' ')
                .trim();

              // reformat prêts
              var regexes = [/prêt à (.*)/i, /prêt (.*)/i, /pret à (.*)/i, /pret (.*)/i];
              for (var i=0; i<regexes.length; ++i) {
                var pret = regexes[i].exec(row.club);
                if (pret && pret.length > 0) {
                  row.club = pret[1];
                  row.remark = 'prêt';
                  break;
                }                
              }

              // trim
              row.club = row.club.trim().replace(/\bSeville\b/gi, 'Séville');

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
            });
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
