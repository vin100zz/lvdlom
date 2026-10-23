app.directive('lvdlomFilters', function () {
  return {
    scope: {
      cfg: '='
    },
    templateUrl: 'app/directives/filters.html',
    controller: function ($scope) {
      // libellé de l'option « tous » : un filtre inactif n'est pas appliqué
      var ALL = {
        periode: 'Toutes', saison: 'Toutes', competition: 'Toutes', nationalite: 'Toutes', fonction: 'Toutes',
        formeAuClub: 'Indifférent', auClub: 'Indifférent', jyEtais: 'Indifférent'
      };

      $scope.allLabel = function (filter) {
        return ALL[filter.criterion] || 'Tous';
      };

      // la liste déroulante affiche la valeur appliquée, ou « tous » quand le filtre est inactif ;
      // cet état reste dans le composant pour ne pas déclencher la surveillance des filtres de la liste
      $scope.ui = {};
      var sync = function () {
        ($scope.cfg || []).forEach(function (filter, index) {
          // même type que les clés des options (nombre ou texte), sinon la liste ne retrouve pas la valeur
          var option = (filter.options || []).filter(function (o) {
            return String(o.key) === String(filter.value);
          })[0];
          $scope.ui[index] = filter.active && option ? option.key : null;
        });
      };
      $scope.$watch(function () {
        return ($scope.cfg || []).map(function (filter) {
          return (filter.active ? 1 : 0) + ':' + filter.value;
        }).join('|');
      }, sync);

      $scope.choose = function (filter, index) {
        if ($scope.ui[index] !== null && $scope.ui[index] !== undefined && $scope.ui[index] !== '') {
          filter.value = $scope.ui[index];
          filter.active = true;
        } else {
          filter.active = false;
        }
      };

      $scope.toggleActivation = function (filter) {
        filter.active = !filter.active;
      };

      $scope.deactivate = function (filter) {
        filter.active = false;
      };
    }
  };
});
