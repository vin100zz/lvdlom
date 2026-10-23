app.directive('lvdlomDocuments', function (Formatter, Viewer) {

  return {
    scope: {
      documents: '=',
      cfg: '='
    },
    templateUrl: 'app/directives/documents.html',
    controller: function ($scope) {

      var hauteur = function () {
        return ($scope.cfg && $scope.cfg.hauteur) || 190;
      };
      $scope.hauteur = hauteur;

      var removeAccents = function(s){
        var r=s.toLowerCase();
        r = r.replace(new RegExp(/\s/g),"");
        r = r.replace(new RegExp(/[àáâãäå]/g),"a");
        r = r.replace(new RegExp(/æ/g),"ae");
        r = r.replace(new RegExp(/ç/g),"c");
        r = r.replace(new RegExp(/[èéêë]/g),"e");
        r = r.replace(new RegExp(/[ìíîï]/g),"i");
        r = r.replace(new RegExp(/ñ/g),"n");
        r = r.replace(new RegExp(/[òóôõö]/g),"o");
        r = r.replace(new RegExp(/œ/g),"oe");
        r = r.replace(new RegExp(/[ùúûü]/g),"u");
        r = r.replace(new RegExp(/[ýÿ]/g),"y");
        r = r.replace(new RegExp(/\W/g),"");
        return r;
      };

      $scope.getSourceClass = function (source) {
        return removeAccents(source.toLowerCase().replace('\'', '').replace(' ', ''));
      };

      // la visionneuse ne parcourt que les documents disponibles
      $scope.ouvrir = function (index) {
        var document = $scope.documents[index];
        if (document.manquant) {
          return;
        }
        var disponibles = $scope.documents.filter(function (d) {
          return !d.manquant;
        });
        Viewer.open(disponibles, disponibles.indexOf(document));
      };

      var render = function () {
        if (!$scope.documents) {
          return;
        }

        $scope.documents.forEach(function (document) {
          // le service renvoie une image générique quand le fichier n'est pas sur le disque
          document.manquant = !document.path || document.path.indexOf('doc_not_found') >= 0;
          document.dateCourte = Formatter.date(document.date);
          document.titre = [document.source, document.dateCourte].filter(Boolean).join(', ') || 'Document';
          document.sourceClass = document.source ? $scope.getSourceClass(document.source) : '';
          if (document.manquant) {
            document.largeur = Math.round(hauteur() * 0.74);
            return;
          }
          if (!document.largeur) {
            document.largeur = Math.round(hauteur() * 0.74);
          }
          var img = new Image();
          img.onload = function() {
            document.largeur = Math.max(Math.round(hauteur() * 0.7), Math.round(this.naturalWidth * hauteur() / this.naturalHeight));
            document.ratio = this.naturalWidth / this.naturalHeight;
            $scope.$applyAsync();
          };
          img.onerror = function () {
            document.manquant = true;
            $scope.$applyAsync();
          };
          img.src = document.path;
        });
      };

      render();

      $scope.$watch('documents', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          render();
        }
      });
      $scope.$watch('documents.length', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          render();
        }
      });
    }
  };
});
