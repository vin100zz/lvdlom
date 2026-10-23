// Visionneuse de documents : le document le plus grand possible sur fond marine,
// sa source et sa date dessous, fermer en haut à droite, flèches et clavier pour passer au suivant
app.service('Viewer', function ($rootScope) {
  var state = {open: false, documents: [], index: 0};
  this.state = state;

  this.open = function (documents, index) {
    if (!documents || !documents.length) {
      return;
    }
    state.documents = documents;
    state.index = Math.max(0, Math.min(index || 0, documents.length - 1));
    state.opener = window.document.activeElement;
    state.open = true;
    $rootScope.$broadcast('viewer.open');
  };

  this.close = function () {
    state.open = false;
    if (state.opener && state.opener.focus) {
      state.opener.focus();
    }
  };

  this.move = function (step) {
    var n = state.documents.length;
    state.index = (state.index + step + n) % n;
  };
});

app.directive('lvdlomViewer', function (Viewer, Formatter, $timeout) {
  return {
    scope: {},
    templateUrl: 'app/directives/viewer.html',
    controller: function ($scope, $element) {
      $scope.state = Viewer.state;
      $scope.close = Viewer.close;
      $scope.move = Viewer.move;

      $scope.current = function () {
        return Viewer.state.documents[Viewer.state.index] || {};
      };
      $scope.titre = function () {
        var d = $scope.current();
        return [d.source, Formatter.date(d.date)].filter(Boolean).join(' · ');
      };

      $scope.$on('viewer.open', function () {
        $timeout(function () {
          var close = $element[0].querySelector('.viewer-close');
          if (close) {
            close.focus();
          }
        }, 0, false);
      });

      var onKey = function (event) {
        if (!Viewer.state.open) {
          return;
        }
        if (event.keyCode === 27) {
          $scope.$apply(Viewer.close);
        } else if (event.keyCode === 37 && Viewer.state.documents.length > 1) {
          $scope.$apply(function () { Viewer.move(-1); });
        } else if (event.keyCode === 39 && Viewer.state.documents.length > 1) {
          $scope.$apply(function () { Viewer.move(1); });
        }
      };
      window.document.addEventListener('keydown', onKey);
      $scope.$on('$destroy', function () {
        window.document.removeEventListener('keydown', onKey);
      });
    }
  };
});
