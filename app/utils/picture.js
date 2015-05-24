app.service('Picture', function () {
  
  var _baseDir = '../laviedelom/';
  
  this.joueur = function (id) {
    return _baseDir + 'photos/id_joueurs/' + id + '.jpg';
  };
  
  this.club = function (id) {
    return _baseDir + 'style/clubs/large/' + id + '.png';
  };
  
});