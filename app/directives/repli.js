// Un écusson indisponible reste masqué, sans image cassée ni badge de remplacement.
app.directive('lvdlomRepli', function () {
  return {
    restrict: 'A',
    link: function (scope, element) {
      var display = element[0].style.display;
      function hide () {
        element.css('display', 'none');
      }
      function show () {
        element.css('display', display);
      }
      element.on('error', hide);
      element.on('load', show);
      scope.$on('$destroy', function () {
        element.off('error', hide);
        element.off('load', show);
      });
    }
  };
});
