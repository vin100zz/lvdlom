var app = angular.module('lvdlom', ['ngResource', 'ngRoute', 'ngSanitize']);

// routing
app.config(['$routeProvider', function ($routeProvider) {
  
  var dependencies = {
    'Dictionary': function (Dictionary){
      return Dictionary.init;
    }
  };
  
  $routeProvider
  .when('/date', {templateUrl: 'app/modules/date.html', controller: 'DayCtrl'})
  .when('/date/:date', {templateUrl: 'app/modules/date.html', controller: 'DayCtrl'})
  .when('/joueurs', {templateUrl: 'app/modules/common/abstractList.html', controller: 'JoueursCtrl', resolve: dependencies})
  .when('/stats-joueurs', {templateUrl: 'app/modules/common/abstractList.html', controller: 'StatsJoueursCtrl', resolve: dependencies})
  .when('/joueur/:id', {templateUrl: 'app/modules/joueur.html', controller: 'JoueurCtrl'})
  .when('/matches', {templateUrl: 'app/modules/common/abstractList.html', controller: 'MatchesCtrl', resolve: dependencies})
  //.when('/match/:id', {templateUrl: 'app/modules/common/abstractList.html', controller: 'MatchCtrl'})
  .when('/adversaires', {templateUrl: 'app/modules/common/abstractList.html', controller: 'AdversairesCtrl', resolve: dependencies})
  .when('/competitions', {templateUrl: 'app/modules/common/abstractList.html', controller: 'CompetitionsCtrl', resolve: dependencies})
  .when('/saisons', {templateUrl: 'app/modules/common/abstractList.html', controller: 'SaisonsCtrl', resolve: dependencies})
  .otherwise({redirectTo: '/date'});
}]);

// controller
app.controller('MainCtrl', function($scope, $location, Loading, $http) {
  $scope.loading = Loading.isLoading();
  
  $scope.$on('loading.update', function () {
    $scope.loading = Loading.isLoading();
  });
  
  $scope.menu = [
    {title: 'Accueil', hash: 'home', last: true},
    {title: 'Infos Joueurs', hash: 'joueurs'},
    {title: 'Stats Joueurs', hash: 'stats-joueurs'},
    {title: 'Âge', hash: 'age', last: true},
    {title: 'Infos Dirigeants', hash: 'dirigeants'},
    {title: 'Stats Entraîneurs', hash: 'stats-entraineurs', last: true},
    {title: 'Matches', hash: 'matches'},
    {title: 'Adversaires', hash: 'adversaires'},
    {title: 'Compétitions', hash: 'competitions', last: true},
    {title: 'Saisons', hash: 'saisons'},
    {title: 'Séries', hash: 'series', last: true},
    {title: 'Historique', hash: 'histo'},
    {title: 'Timeline', hash: 'timeline', last: true},
    {title: 'Avancement', hash: 'avancement'}
  ];
  
  $scope.isCurrentHash = function (hash) {
    return hash === $location.path().substr(1);
  };

  $http.get('services/actu.php')
  .success(function (data, status, headers, config) {
    $scope.actu = data;
  });
  
});


