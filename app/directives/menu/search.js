app.directive('lvdlomSearch', function (Dictionary, Formatter) {
  
  return {
    scope: {
      cfg: '='
    },
    templateUrl: 'app/directives/menu/search.html',
    controller: function ($scope) {
      
      $scope.expanded = true;
      
      $scope.test = function (regex, item) {
        return regex.test(item.label.toLowerCase());
      };
      
      $scope.format = function (remark, link, item) {
        var index = item.label.toLowerCase().indexOf($scope.cfg.pattern.toLowerCase());
        
        return {
          preMatch: item.label.substr(0, index),
          match: item.label.substr(index, $scope.cfg.pattern.length),
          postMatch: item.label.substr(index + $scope.cfg.pattern.length),
          link: '#/' + link + '/' + item.key,
          remark: remark
        };
      };
      
      $scope.formatMatch = function (item) {
        item = JSON.parse(JSON.stringify(item));
        var data = item.label.split(',');
        item.label = data[0] + ' ' + data[2] + '-' + data[3];
        return $scope.format(Formatter.dateLong(data[1]), 'match', item); 
      };
      
      $scope.search = function () {
        if ($scope.cfg.pattern.length > 2) {
          var regex = new RegExp($scope.cfg.pattern, 'i');
          var test = $scope.test.bind(this, regex);
          $scope.results = Dictionary.joueurs().filter(test).map($scope.format.bind(this, 'Joueur', 'joueur'))
          .concat(Dictionary.dirigeants().filter(test).map($scope.format.bind(this, 'Dirigeant', 'dirigeant')))
          .concat(Dictionary.matches().filter(test).map($scope.formatMatch.bind(this)));
        } else {
          $scope.results = [];
        }
      };
      
      // watch
      $scope.$watch('cfg.pattern', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          $scope.search();
        }
      }, true);
      
      // events
      $scope.$on('click', function (scope, evt) {
        $scope.expanded = (evt.target.id === 'search-field-input');
      });

    }
    
  };
});
 
