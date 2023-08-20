var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var levenshtein = require('fast-levenshtein');

app.get('/scrape', function(req, res) {

  var result = [];
 
  var work = function (id, cb) {

    url = 'http://www.om1899.com/joueurs.php?id=' + id;

    request(url, function(error, response, html) {

      if (!error) {
        var $ = cheerio.load(html);
        
        var scrapped = {
          id: id,
          nom: null,
          carriere: []
        };
        
        $('.infos h1').filter(function () {
          scrapped.nom = $(this).text().trim();
        });
        
        $('.carriere tbody').filter(function () {
          $(this).children().each(function (row) {
            scrapped.carriere.push({
              saison: $($(this).children()[1]).text().trim(),
              club: $($(this).children()[2]).text().trim()
            });
          });
        });
              
        result.push(scrapped);
        
        cb();
        
        console.log(id);
        
        //res.send(scrapped.nom);
      } else {
        res.send('Error: ' + error);
      }
    });
  };
  
  var i=0;
  var next = function () {
    ++i;
    if (i<=2431) {
      work(i, next);
    } else {
      fs.writeFile('output.json', JSON.stringify(result), function (err){
        if (err) throw err;
        //console.log('File successfully written! - Check your project directory for the output.json file');
      });
    }
    
  };
  
  next();
});



var updateIndex = 0;

app.get('/parse', function(req, res) {

  request('http://127.0.0.1/edsa-messites/lvdlom/services/joueurs.php', function (error, response, html) {

    var myData = JSON.parse(html.trim());
  
    fs.readFile('output.json', function (err, data) {
      if (err) throw err;
      data = JSON.parse(data);
      
      data.forEach(function (d) {
        if (d.nom) {
          // extract family name
          d.extractedNom = d.nom.split(' ').filter(function (str) {
            return str.split('').every(function (letter) {
              return letter === letter.toUpperCase();
            });
          }).join(' ');
        }
      });
      
      var mapping = {};
      
      var out = '<table>';
      myData.forEach(function (myJoueur) {
        out += '<tr>';
        out += '<td>' + myJoueur.id + ' ' + myJoueur.prenom + ' ' + myJoueur.nom + '<td/>';
        out += '<td>' + myJoueur.idOm1899 + '<td/>';
        
        var minDist = {ids: [], value: 99999};
        var lastMatch = null;
        data.forEach(function (d) {
          if (d.extractedNom) {
            var distance = levenshtein.get(d.extractedNom, myJoueur.nom);
            if (distance < minDist.value) {
              minDist.value = distance;
              minDist.ids = [d.id];
              minDist.names = [d.id + ' ' + d.nom];
              lastMatch = d;
            } else if (distance === minDist.value) {
              minDist.ids.push(d.id);
              minDist.names.push(d.id + ' ' + d.nom);
              lastMatch = d;
            }
          }
        });
        var css = myJoueur.idOm1899 ? 'lightblue' : (minDist.ids.length > 1 ? 'lightcoral' : (minDist.value > 1 ? 'gold' : 'greenyellow'));
        out += '<td style="background: ' + css + ';">[' + minDist.value + '] ' + minDist.names.join(', ') + '</td>';
        
        out += '</tr>';
        
        if (myJoueur.idOm1899) {
          mapping[myJoueur.id] = data.find(function (d) {return d.id + '' === myJoueur.idOm1899 + '';});
        } else if (minDist.ids.length === 1) {
          mapping[myJoueur.id] = lastMatch;

          if (!myJoueur.idOm1899) {
            ++updateIndex;
            var url = 'http://127.0.0.1/edsa-messites/lvdlom/services/om1899-id-db-update.php?idJoueur=' + myJoueur.id + '&idOm1899=' + minDist.ids[0];
            setTimeout(function () {
              request(url, function(error, response, html) {
                console.log(myJoueur.id, html);
              });
            }, 100*updateIndex);
          }
        }
      });

      out += '</table>';
      res.send(out);
      
      fs.writeFile('mapping.json', JSON.stringify(mapping), function (err){
        if (err) throw err;
      });      
    });
    
  });
});

app.listen('8083');
console.log('URL = http://localhost:8083/');
exports = module.exports = app;

