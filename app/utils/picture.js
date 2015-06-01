app.service('Picture', function () {
  
  var _baseDir = './';
  var _baseDirOld = '../laviedelom/';
  
  this.joueur = function (id) {
    return _baseDirOld + 'photos/id_joueurs/' + id + '.jpg';
  };
  
  this.club = function (id) {
    return _baseDir + 'style/clubs/large/' + id + '.png';
  };
  
});