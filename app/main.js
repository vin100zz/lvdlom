var app = angular.module('lvdlom', ['ngResource', 'ngRoute', 'ngSanitize', 'ui.bootstrap']);

// routing
app.config(['$routeProvider', function ($routeProvider) {

  var dependencies = {
    'Dictionary': function (Dictionary) {
      return Dictionary.init;
    }
  };

  $routeProvider
  .when('/adversaires', {templateUrl: 'app/modules/common/abstractList.html', controller: 'AdversairesCtrl', resolve: dependencies})
  .when('/age', {templateUrl: 'app/modules/age.html', controller: 'AgeCtrl', resolve: dependencies})
  .when('/anniversaire', {templateUrl: 'app/modules/anniversaire.html', controller: 'DayCtrl', resolve: dependencies})
  .when('/anniversaire/:date', {templateUrl: 'app/modules/anniversaire.html', controller: 'DayCtrl', resolve: dependencies})
  .when('/avancement', {templateUrl: 'app/modules/avancement.html', controller: 'AvancementCtrl', resolve: dependencies})
  .when('/competitions', {templateUrl: 'app/modules/common/abstractList.html', controller: 'CompetitionsCtrl', resolve: dependencies})
  .when('/dirigeant/:id', {templateUrl: 'app/modules/dirigeant.html', controller: 'DirigeantCtrl', resolve: dependencies})
  .when('/dirigeants', {templateUrl: 'app/modules/common/abstractList.html', controller: 'DirigeantsCtrl', resolve: dependencies})
  .when('/equipe-types', {templateUrl: 'app/modules/equipe-types.html', controller: 'EquipeTypesCtrl', resolve: dependencies})
  .when('/joueur/:id', {templateUrl: 'app/modules/joueur.html', controller: 'JoueurCtrl', resolve: dependencies})
  .when('/joueurs', {templateUrl: 'app/modules/common/abstractList.html', controller: 'JoueursCtrl', resolve: dependencies})
  .when('/match/:id', {templateUrl: 'app/modules/match.html', controller: 'MatchCtrl', resolve: dependencies})
  .when('/matches', {templateUrl: 'app/modules/common/abstractList.html', controller: 'MatchesCtrl', resolve: dependencies})
  .when('/matches/:filter/:id', {templateUrl: 'app/modules/common/abstractList.html', controller: 'MatchesCtrl', resolve: dependencies})
  .when('/matches-joueur/:id', {templateUrl: 'app/modules/matchesJoueur.html', controller: 'MatchesJoueurCtrl', resolve: dependencies})
  .when('/origines', {templateUrl: 'app/modules/origines.html', controller: 'OriginesCtrl', resolve: dependencies})
  .when('/palmares', {templateUrl: 'app/modules/palmares.html', controller: 'PalmaresCtrl', resolve: dependencies})
  .when('/saison/:id', {templateUrl: 'app/modules/saison.html', controller: 'SaisonCtrl', resolve: dependencies})
  .when('/saisons', {templateUrl: 'app/modules/common/abstractList.html', controller: 'SaisonsCtrl', resolve: dependencies})
  .when('/series', {templateUrl: 'app/modules/series.html', controller: 'SeriesCtrl', resolve: dependencies})
  .when('/stats-entraineurs', {templateUrl: 'app/modules/common/abstractList.html', controller: 'StatsEntraineursCtrl', resolve: dependencies})
  .when('/stats-joueurs', {templateUrl: 'app/modules/common/abstractList.html', controller: 'StatsJoueursCtrl', resolve: dependencies})
  .when('/debug/maillots-design', {templateUrl: 'app/modules/debug/maillots-design.html', controller: 'DebugMaillotsDesignCtrl', resolve: dependencies})
  .when('/debug/maillots-all/:index', {templateUrl: 'app/modules/debug/maillots-all.html', controller: 'DebugMaillotsAllCtrl', resolve: dependencies})
  .when('/saisie/:action/:type?/:id?', {templateUrl: 'app/modules/saisie/saisie.html', controller: 'SaisieCtrl', resolve: dependencies})
  .when('/timeline', {templateUrl: 'app/modules/timeline.html', controller: 'TimelineCtrl', resolve: dependencies})
  .otherwise({redirectTo: '/anniversaire'});
}]);

// controller
app.controller('MainCtrl', function ($scope, $timeout, $http, Loading, Dictionary, Picture) {
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

  // barre d'actualité : écussons, résultat et dates courtes (« Jeu 22 · 18h45 »)
  var normalize = function (name) {
    return (name || '').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Z0-9]/g, '');
  };

  var ecusson = function (name) {
    if (normalize(name) === 'OM') {
      var saisons = Dictionary.saisons() || [];
      return Picture.club('OM', saisons.length ? saisons[0].key : null);
    }
    var adversaire = (Dictionary.adversaires() || []).filter(function (a) {
      return normalize(a.label) === normalize(name);
    })[0];
    return adversaire ? Picture.club(adversaire.key) : null;
  };

  var dateCourte = function (date) {
    var m = /^(\S+)\s+(\d+)\s*\((.+)\)$/.exec((date || '').trim());
    return m ? m[1].charAt(0).toUpperCase() + m[1].substring(1, 3) + ' ' + m[2] + ' · ' + m[3] : date;
  };

  var decorateActu = function (actu) {
    var dernier = actu.dernierMatch;
    if (dernier) {
      dernier.ecussonGauche = ecusson(dernier.clubGauche);
      dernier.ecussonDroite = ecusson(dernier.clubDroite);
      var omAGauche = normalize(dernier.clubGauche) === 'OM';
      var butsOM = parseInt(omAGauche ? dernier.butsGauche : dernier.butsDroite, 10);
      var butsAdv = parseInt(omAGauche ? dernier.butsDroite : dernier.butsGauche, 10);
      if (!isNaN(butsOM) && !isNaN(butsAdv)) {
        dernier.resultat = butsOM > butsAdv ? 'V' : (butsOM < butsAdv ? 'D' : 'N');
        dernier.resultatLabel = {V: 'Victoire', N: 'Nul', D: 'Défaite'}[dernier.resultat];
      }
    }
    (actu.prochainsMatches || []).forEach(function (prochain) {
      var clubs = (prochain.match || '').split(' - ');
      var adversaire = clubs.filter(function (club) {
        return normalize(club) !== 'OM';
      })[0];
      prochain.ecusson = adversaire ? ecusson(adversaire) : null;
      prochain.affiche = clubs.join(' – ').toUpperCase();
      prochain.dateCourte = dateCourte(prochain.date);
    });
    return actu;
  };

  $http.get('services/actu.php')
  .success(function (data, status, headers, config) {
    Dictionary.init.then(function () {
      $scope.actu = decorateActu(data);
    });
  });

  // click
  $scope.onClick = function (evt) {
    if (evt.target.id !== 'hamburger' && evt.target.id !== 'search-field-input') {
      $scope.menuCfg.offCanvas = true;
    }
    $scope.$broadcast('click', evt);
  };

  // alert
  $scope.alert = {
    show: false,
    type: null,
    message: null
  };

  $scope.closeAlert = function () {
    $scope.alert.show = false;
  };

  $scope.$on('alert.new', function (evt, type, message) {
    $scope.alert.message = message;
    $scope.alert.type = type;
    $scope.alert.show = true;
    $timeout(function () {
      $scope.closeAlert();
    }, 4000);
  });

});
