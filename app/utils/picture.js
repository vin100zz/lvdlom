app.service('Picture', function () {
  
  this.joueur = function (id) {
    return 'documents/id_joueurs/' + id + '.jpg';
  };
  
  this.club = function (id) {
    return 'style/clubs/large/' + id + '.png';
  };
  
});