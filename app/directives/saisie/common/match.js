app.directive('lvdlomSaisieCommonMatch', function () {
  return {
    scope: {
      cfg: '='
    },
    templateUrl: 'app/directives/saisie/common/match.html',
    controller: function ($scope, $rootScope, Dictionary, Formatter, Widget) {
      $scope.Widget = Widget;

      $scope.dictionary = {
        joueurs: Dictionary.joueurs(),
        dirigeants: Dictionary.dirigeants(),
        saisons: Dictionary.saisons(),
        lieux: Dictionary.lieux(),
        competitions: Dictionary.competitions(),
        niveaux: Dictionary.niveaux(),
        adversaires: Dictionary.adversaires(),
        rqScore: ['ap', 'tab']
      };

      $scope.cfg.data = {
        butsOM: 0,
        butsAdv: 0,
        tabOM: 0,
        tabAdv: 0,
        buteursOM: [],
        buteursAdv: []
      };

      $scope.changeButsOM = function () {
        $scope.cfg.data.buteursOM = [];
        for (var i=0; i<$scope.cfg.data.butsOM; ++i) {
          $scope.cfg.data.buteursOM.push({
            minute: 0,
            csc: false,
            joueur: null,
            nomCsc: '',
            penalty: false
          });
        }
      };

      $scope.changeButsAdv = function () {
        $scope.cfg.data.buteursAdv = [];
        for (var i=0; i<$scope.cfg.data.butsAdv; ++i) {
          $scope.cfg.data.buteursAdv.push({
            minute: 0,
            csc: false,
            nom: '',
            penalty: false
          });
        }
      };
    }
  };
});