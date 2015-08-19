app.service('Picture', function () {
  
  this.joueur = function (id) {
    return 'documents/id_joueurs/' + id + '.jpg';
  };
  
  this.dirigeant = function (id) {
    return 'documents/id_dirigeants/' + id + '.jpg';
  };
  
  this.club = function (id) {
    return 'style/clubs/large/' + id + '.png';
  };

  this.saison = function (id) {
    return 'documents/id_saisons/' + id + '.jpg';
  };
  
});