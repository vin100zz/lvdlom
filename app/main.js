var app = angular.module('lvdlom', ['ngResource', 'ngRoute', 'ngSanitize']);

// routing
app.config(['$routeProvider', function ($routeProvider) {
  
  var dependencies = {
    'Dictionary': function (Dictionary){
      return Dictionary.init;
    }
  };
  
  $routeProvider
  .when('/adversaires', {templateUrl: 'app/modules/common/abstractList.html', controller: 'AdversairesCtrl', resolve: dependencies})
  .when('/age', {templateUrl: 'app/modules/age.html', controller: 'AgeCtrl', resolve: dependencies})
  .when('/competitions', {templateUrl: 'app/modules/common/abstractList.html', controller: 'CompetitionsCtrl', resolve: dependencies})
  .when('/date', {templateUrl: 'app/modules/date.html', controller: 'DayCtrl', resolve: dependencies})
  .when('/date/:date', {templateUrl: 'app/modules/date.html', controller: 'DayCtrl', resolve: dependencies})
  .when('/dirigeant/:id', {templateUrl: 'app/modules/dirigeant.html', controller: 'DirigeantCtrl', resolve: dependencies})
  .when('/dirigeants', {templateUrl: 'app/modules/common/abstractList.html', controller: 'DirigeantsCtrl', resolve: dependencies})
  .when('/equipe-types', {templateUrl: 'app/modules/equipe-types.html', controller: 'EquipeTypesCtrl', resolve: dependencies})
  .when('/joueur/:id', {templateUrl: 'app/modules/joueur.html', controller: 'JoueurCtrl', resolve: dependencies})
  .when('/joueurs', {templateUrl: 'app/modules/common/abstractList.html', controller: 'JoueursCtrl', resolve: dependencies})
  .when('/match/:id', {templateUrl: 'app/modules/match.html', controller: 'MatchCtrl', resolve: dependencies})
  .when('/matches', {templateUrl: 'app/modules/common/abstractList.html', controller: 'MatchesCtrl', resolve: dependencies})
  .when('/saison/:id', {templateUrl: 'app/modules/saison.html', controller: 'SaisonCtrl', resolve: dependencies})
  .when('/saisons', {templateUrl: 'app/modules/common/abstractList.html', controller: 'SaisonsCtrl', resolve: dependencies})
  .when('/stats-entraineurs', {templateUrl: 'app/modules/common/abstractList.html', controller: 'StatsEntraineursCtrl', resolve: dependencies})
  .when('/stats-joueurs', {templateUrl: 'app/modules/common/abstractList.html', controller: 'StatsJoueursCtrl', resolve: dependencies})
  .when('/debug/maillots', {templateUrl: 'app/modules/debug/maillots.html', controller: 'DebugMaillotsCtrl', resolve: dependencies})
  .otherwise({redirectTo: '/date'});
}]);

// controller
app.controller('MainCtrl', function($scope, Loading, $http) {
  $scope.loading = Loading.isLoading();
  
  $scope.$on('loading.update', function () {
    $scope.loading = Loading.isLoading();
  });
  
  // menu
  $scope.menuCfg = {
    offCanvas: true
  };
  
  $scope.toggleMenu = function () {
    $scope.menuCfg.offCanvas = !$scope.menuCfg.offCanvas;
  };
  
  $scope.hideMenu = function () {
    $scope.menuCfg.offCanvas = true;
  };
  
  // search
  $scope.searchCfg = {
    pattern: ''
  };
  
  $http.get('services/actu.php')
  .success(function (data, status, headers, config) {
    $scope.actu = data;
  });
  
});


