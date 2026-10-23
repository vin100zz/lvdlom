// Image de repli : quand un écusson ou une photo manque, on affiche ses initiales à la place
app.directive('lvdlomRepli', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      element.on('error', function () {
        var img = element[0];
        var style = window.getComputedStyle(img);
        var repli = angular.element('<span aria-hidden="true"></span>');
        repli.text(attrs.lvdlomRepli || '');
        repli.attr('class', 'g-repli ' + (img.className || ''));
        // une image cassée n'a pas de largeur utile : on garde la proportion d'un écusson
        var h = parseFloat(style.height) || 0, w = parseFloat(style.width) || 0;
        if (h && (!w || w < h * 0.6)) {
          w = Math.round(h * 0.86);
        }
        repli.css({width: w ? w + 'px' : style.width, height: h ? h + 'px' : style.height, fontSize: h ? Math.round(h * 0.4) + 'px' : ''});
        element.replaceWith(repli);
      });
    }
  };
});
