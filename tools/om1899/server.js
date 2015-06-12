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
        
        $('.carriere').filter(function () {
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
  
  var i=0; // 1785
  var next = function () {
    ++i;
    if (i<=4) {
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


app.get('/parse', function(req, res) {

  fs.readFile('joueurs.json', function (myErr, myData) {
    if (myErr) throw myErr;
    myData = JSON.parse(myData);
  
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
      
      var out = '<table>';
      myData.forEach(function (myJoueur) {
        out += '<tr>';
        out += '<td>' + myJoueur.id + ' ' + myJoueur.nom + '<td/>';
        
        var minDist = {ids: [], value: 99999};
        data.forEach(function (d) {
          if (d.extractedNom) {
            var distance = levenshtein.get(d.extractedNom, myJoueur.nom);
            if (distance < minDist.value) {
              minDist.value = distance;
              minDist.ids = [d.id + ' ' + d.nom];
            } else if (distance === minDist.value) {
              minDist.ids.push(d.id + ' ' + d.nom);
            }
          }
        });
        var css = minDist.ids.length > 1 ? 'lightcoral' : (minDist.value > 1 ? 'gold' : 'greenyellow');
        out += '<td style="background: ' + css + ';">[' + minDist.value + '] ' + minDist.ids.join(', ') + '</td>';
        
        out += '</tr>';
      });

      out += '</table>';
      res.send(out);
    });
    
  });

});

app.listen('8083');
console.log('URL = http://localhost:8083/');
exports = module.exports = app;
