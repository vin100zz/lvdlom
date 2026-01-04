app.directive('lvdlomMenu', function () {
  
  return {
    scope: {
      cfg: '=',
      searchCfg: '='
    },
    templateUrl: 'app/directives/menu/menu.html',
    controller: function ($scope, $location) {
      $scope.menu = [
        {title: 'Origines', hash: 'origines'},
        {title: 'Anniversaires', hash: 'date', last: true},
        {title: 'Joueurs', hash: 'joueurs'},
        {title: 'Stats Joueurs', hash: 'stats-joueurs'},
        {title: 'Âge', hash: 'age', last: true},
        {title: 'Dirigeants', hash: 'dirigeants'},
        {title: 'Stats Entraîneurs', hash: 'stats-entraineurs', last: true},
        {title: 'Matches', hash: 'matches'},
        {title: 'Adversaires', hash: 'adversaires'},
        {title: 'Séries', hash: 'series', last: true},
        {title: 'Saisons', hash: 'saisons'},
        {title: 'Équipe-types', hash: 'equipe-types'},
        {title: 'Timeline', hash: 'timeline', last: true},
        {title: 'Compétitions', hash: 'competitions'},
        {title: 'Palmarès', hash: 'palmares', last: true},
        {title: 'Avancement', hash: 'avancement'}
      ];
      
      $scope.isCurrentHash = function (hash) {
        return hash === $location.path().substr(1);
      };
      
      $scope.clearSearch = function () {
        $scope.searchCfg.pattern = '';
      };
    }
    
  };
});
 
