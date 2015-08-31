app.directive('lvdlomSearch', function (Dictionary, Formatter, Diacritics) {
  
  return {
    scope: {
      cfg: '='
    },
    templateUrl: 'app/directives/menu/search.html',
    controller: function ($scope) {
      
      $scope.expanded = true;

      var dictionary = {};

      Dictionary.whenReady(function () {
        dictionary = {
          joueurs: prepareData(Dictionary.joueurs(), sanitizePerson, formatPerson.bind(this, 'Joueur', 'joueur')),
          dirigeants: prepareData(Dictionary.dirigeants(), sanitizePerson, formatPerson.bind(this, 'Dirigeant', 'dirigeant')),
          matches: prepareData(Dictionary.matches(), sanitizeMatch, formatMatch)
        };
      });

      function prepareData (data, sanitizeFn, formatFn) {
        return data.map(function (item) {
          return {
            key: item.key,
            search: sanitizeFn(item),
            display: formatFn(item)
          };
        });
      }

     function search () {
        if ($scope.cfg.pattern.length > 2) {
          var searchPattern = Diacritics.removeDiacritics($scope.cfg.pattern).toLowerCase();
          var compareFn = compare.bind(this, searchPattern);
          $scope.results = dictionary.joueurs.map(compareFn)
                          .concat(dictionary.dirigeants.map(compareFn))
                          .concat(dictionary.matches.map(compareFn))
                          .filter(function (item) {return !!item;});
        } else {
          $scope.results = [];
        }
      }

      function sanitizePerson (person) {
        return Diacritics.removeDiacritics(person.label).toLowerCase();
      }

      function sanitizeMatch (match) {
        return Diacritics.removeDiacritics(match.label).toLowerCase();
      }
      
      function formatPerson (remark, link, item) {        
        return {
          label: item.label,
          link: '#/' + link + '/' + item.key,
          remark: remark
        };
      }
      
      function formatMatch (item) {
        var data = item.label.split(',');
        return {
          label: data[0] + ' ' + data[2] + '-' + data[3],
          link: '#/match/' + item.key,
          remark: Formatter.dateLong(data[1])
        };
      }
      
      function compare (searchPattern, item) {
        var index = item.search.indexOf(searchPattern);
        if (index !== -1) {
          return {
            preMatch: item.display.label.substr(0, index),
            match: item.display.label.substr(index, searchPattern.length),
            postMatch: item.display.label.substr(index + searchPattern.length),
            link: item.display.link,
            remark: item.display.remark
          };
        }
        return null;
      }
      
      // watch
      $scope.$watch('cfg.pattern', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          search();
        }
      }, true);
      
      // events
      $scope.$on('click', function (scope, evt) {
        $scope.expanded = (evt.target.id === 'search-field-input');
      });

    }
    
  };
});
 
