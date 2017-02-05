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
        joueursAuClub: Dictionary.joueursAuClub(),
        dirigeants: Dictionary.dirigeants(),
        saisons: Dictionary.saisons(),
        lieux: Dictionary.lieux(),
        competitions: Dictionary.competitions(),
        niveaux: Dictionary.niveaux(),
        adversaires: Dictionary.adversaires(),
        jyEtais: Dictionary.jyEtais(),
        rqScore: ['ap', 'tab'],
        carton: ['A', 'E']
      };

      $scope.cfg.data = {
        type: 'match',
        butsOM: 0,
        butsAdv: 0,
        tabOM: 0,
        tabAdv: 0,
        buteursOM: [],
        buteursAdv: [],
        titulaires: [],
        remplacants: [],
        classement: []
      };

      $scope.prepareData = function () {
        // titulaires
        $scope.cfg.data.titulaires = [];
        for (var i=0; i<11; ++i) {
          $scope.cfg.data.titulaires.push({
            joueur: null,
            carton: '',
            minuteCarton: null,
            remplacement: null,
            minuteRemplacement: null
          });
        }

        // remplacants
        $scope.cfg.data.remplacants = [];
        for (i=0; i<3; ++i) {
          $scope.cfg.data.remplacants.push({
            joueur: null,
            carton: '',
            minuteCarton: null,
            minuteRemplacement: null
          });
        }

        // classement
        $scope.cfg.data.classement = [];
        for (i=0; i<4; ++i) {
          $scope.cfg.data.classement.push({
            equipe: null,
            pts: null
          });
        }
      };

      $scope.changeButsOM = function () {
        $scope.cfg.data.buteursOM = [];
        for (var i=0; i<$scope.cfg.data.butsOM; ++i) {
          $scope.cfg.data.buteursOM.push({
            minute: null,
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
            minute: null,
            csc: false,
            nom: '',
            penalty: false
          });
        }
      };

      $scope.changeButsOM();
      $scope.changeButsAdv();
      $scope.prepareData();

      // helpers
      $scope.setLastSaison = function (evt) {
        evt.preventDefault();
        $scope.cfg.data.saison = $scope.dictionary.saisons[0].key;
      };
      $scope.setStadeVel = function (evt) {
        evt.preventDefault();
        $scope.cfg.data.lieu = 'Orange Vélodrome';
      };
      $scope.setLigue1 = function (evt) {
        evt.preventDefault();
        $scope.cfg.data.competition = 'Ligue 1';
      };
      $scope.setNextJoueur = function (evt, selectedJoueur) {
        evt.preventDefault();
        for (var i=0; i<$scope.cfg.data.buteursOM.length; ++i) {
          var joueur = $scope.cfg.data.buteursOM[i];
          if (!joueur.joueur || !joueur.joueur.key) {
            joueur.joueur = selectedJoueur;
            return;
          }
        }
        for (i=0; i<$scope.cfg.data.titulaires.length; ++i) {
          joueur = $scope.cfg.data.titulaires[i];
          if (!joueur.joueur || !joueur.joueur.key) {
            joueur.joueur = selectedJoueur;
            return;
          }
        }
        for (i=0; i<$scope.cfg.data.remplacants.length; ++i) {
          joueur = $scope.cfg.data.remplacants[i];
          if (!joueur.joueur || !joueur.joueur.key) {
            joueur.joueur = selectedJoueur;
            return;
          }
        }
      };
    }
  };
});