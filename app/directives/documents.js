app.directive('lvdlomDocuments', function () {
  
  return {
    scope: {
      documents: '='
    },
    templateUrl: 'app/directives/documents.html',
    controller: function ($scope) {
      
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
      
      var render = function () {
        if (!$scope.documents) {
          return;
        }
        
        $scope.documents.forEach(function (document) {
          var img = new Image();
          img.onload = function() {
            var wishedHeight = 300;
            var containerWidth = window.document.querySelector('.dir-documents').offsetWidth - 2*10;
            
            document.width = Math.min(this.naturalWidth * wishedHeight / this.naturalHeight, containerWidth);  
            document.height = this.naturalHeight * document.width / this.naturalWidth;
            
            $scope.$apply();
          }
          img.src = document.path;
        });
      };

      render();
      
      $scope.$watch('documents', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          render();
        }
      }, true);
    }
  };
});
 