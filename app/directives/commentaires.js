// Commentaires saisis en HTML (Origines, saisons) : un clic sur une image l'ouvre dans la visionneuse
app.directive('lvdlomCommentaires', function (Viewer) {
  return {
    restrict: 'A',
    link: function (scope, element) {
      element.on('click', function (event) {
        var lien = event.target.closest ? event.target.closest('a') : null;
        if (!lien || !lien.querySelector('img') || !element[0].contains(lien)) {
          return;
        }
        event.preventDefault();
        var liens = Array.prototype.filter.call(element[0].querySelectorAll('a'), function (a) {
          return a.querySelector('img');
        });
        var documents = liens.map(function (a) {
          return {path: a.getAttribute('href') || a.querySelector('img').getAttribute('src')};
        });
        scope.$apply(function () {
          Viewer.open(documents, liens.indexOf(lien));
        });
      });
    }
  };
});
