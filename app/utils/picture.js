app.service('Picture', function () {
  
  this.joueur = function (id) {
    return 'documents/id_joueurs/' + id + '.jpg';
  };
  
  this.dirigeant = function (id) {
    return 'documents/id_dirigeants/' + id + '.jpg';
  };
  
  this.club = function (id, saison) {
    if (id === 'OM' && saison) {
      var year = parseInt(saison.substring(0, 4), 10);
      var era;
      if      (year < 1910) era = '1899';
      else if (year < 1935) era = '1910';
      else if (year < 1972) era = '1935';
      else if (year < 1981) era = '1972';
      else if (year < 1986) era = '1981';
      else if (year < 1990) era = '1986';
      else if (year < 1996) era = '1990';
      else if (year < 1998) era = '1996';
      else if (year < 1999) era = '1998';
      else if (year < 2004) era = '1999';
      else if (year < 2026) era = '2004';
      else                  era = '2026';
      return 'style/clubs/large/om/' + era + '.png';
    }
    return 'style/clubs/large/' + id + '.png';
  };

  this.saison = function (id) {
    return 'documents/id_saisons/' + id + '.jpg';
  };
  
});