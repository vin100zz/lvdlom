// Couleurs d'un club pour le hero du match : fond de sa moitié, liseré, couleur du texte.
// Elles sont lues sur l'écusson (couleur dominante, et la plus vive si l'écusson est surtout blanc ou noir).
app.service('ClubColors', function ($q, Picture) {

  var OM = {bg: '#0B4F86', accent: '#2FAEE0'};

  // écussons dont la couleur dominante n'est pas celle du club
  var CORRECTIONS = {
    130: {bg: '#E2001A', accent: '#FFFFFF'}, // MONACO
    140: {bg: '#FCD405', accent: '#00843D'}  // NANTES
  };

  var DEFAULT = {bg: '#10294A', accent: '#8EA2B8'};

  var STORAGE_KEY = 'lvdlom.clubColors.v2';
  var cache = {};
  try {
    cache = JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    cache = {};
  }

  var save = function () {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch (e) {
      // stockage indisponible : les couleurs seront recalculées
    }
  };

  var hex = function (rgb) {
    return '#' + rgb.map(function (v) {
      var h = Math.round(v).toString(16);
      return h.length === 1 ? '0' + h : h;
    }).join('').toUpperCase();
  };

  var rgb = function (color) {
    var h = color.replace('#', '');
    return [0, 2, 4].map(function (i) {
      return parseInt(h.substr(i, 2), 16);
    });
  };

  var luminance = function (color) {
    return rgb(color).reduce(function (sum, v, i) {
      v /= 255;
      v = v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      return sum + v * [0.2126, 0.7152, 0.0722][i];
    }, 0);
  };

  var saturation = function (c) {
    var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var l = (max + min) / 2;
    if (max === min || l <= 0.08 || l >= 0.92) {
      return 0;
    }
    return l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
  };

  var distance = function (a, b) {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2));
  };

  // fond lisible : texte marine sur les fonds clairs, blanc sur les fonds foncés
  var complete = function (colors) {
    var light = luminance(colors.bg) > 0.45;
    return {
      bg: colors.bg,
      accent: colors.accent,
      light: light,
      fg: light ? '#0A2240' : '#FFFFFF',
      sub: light ? 'rgba(10, 34, 64, .78)' : 'rgba(255, 255, 255, .82)'
    };
  };

  var extract = function (img) {
    var size = 48;
    var ratio = Math.min(size / img.naturalWidth, size / img.naturalHeight);
    var w = Math.max(1, Math.round(img.naturalWidth * ratio));
    var h = Math.max(1, Math.round(img.naturalHeight * ratio));
    var canvas = window.document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    var data = ctx.getImageData(0, 0, w, h).data;

    // regroupement des pixels opaques par teinte proche
    var buckets = {}, total = 0;
    for (var i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 200) {
        continue;
      }
      ++total;
      var key = (data[i] >> 5) + '-' + (data[i + 1] >> 5) + '-' + (data[i + 2] >> 5);
      var bucket = buckets[key] || (buckets[key] = [0, 0, 0, 0]);
      bucket[0] += data[i];
      bucket[1] += data[i + 1];
      bucket[2] += data[i + 2];
      bucket[3] += 1;
    }
    var colors = Object.keys(buckets).map(function (key) {
      var b = buckets[key];
      return [b[0] / b[3], b[1] / b[3], b[2] / b[3], b[3]];
    }).sort(function (a, b) {
      return b[3] - a[3];
    });
    var merged = [];
    colors.forEach(function (c) {
      var near = merged.filter(function (m) {
        return distance(c, m) < 60;
      })[0];
      if (near) {
        var n = near[3] + c[3];
        for (var k = 0; k < 3; ++k) {
          near[k] = (near[k] * near[3] + c[k] * c[3]) / n;
        }
        near[3] = n;
      } else {
        merged.push(c.slice());
      }
    });
    merged.sort(function (a, b) {
      return b[3] - a[3];
    });
    if (!merged.length) {
      return DEFAULT;
    }

    var bg = merged[0], accent = null;
    // écusson surtout blanc, gris ou noir : on préfère sa couleur la plus vive
    if (saturation(bg) < 0.25) {
      var vives = merged.slice(1).filter(function (m) {
        return saturation(m) >= 0.35 && m[3] >= total * 0.10;
      }).sort(function (a, b) {
        return saturation(b) * b[3] - saturation(a) * a[3];
      });
      if (vives.length) {
        accent = bg;
        bg = vives[0];
      }
    }
    if (!accent) {
      accent = merged.slice(1).filter(function (m) {
        return distance(m, bg) > 90 && m[3] > total * 0.04;
      })[0];
    }
    // un adversaire presque du même bleu que l'OM passe en marine, pour que les deux moitiés se distinguent
    if (distance(bg, rgb(OM.bg)) < 90) {
      bg = [bg[0] * 0.5, bg[1] * 0.5, bg[2] * 0.62];
    }
    return {bg: hex(bg.slice(0, 3)), accent: accent ? hex(accent.slice(0, 3)) : hex(bg.slice(0, 3))};
  };

  this.get = function (idClub, saison) {
    if (idClub === 'OM') {
      return $q.when(complete(OM));
    }
    if (CORRECTIONS[idClub]) {
      return $q.when(complete(CORRECTIONS[idClub]));
    }
    if (cache[idClub]) {
      return $q.when(complete(cache[idClub]));
    }
    var deferred = $q.defer();
    var img = new Image();
    img.onload = function () {
      var colors = DEFAULT;
      try {
        colors = extract(img);
        cache[idClub] = colors;
        save();
      } catch (e) {
        colors = DEFAULT;
      }
      deferred.resolve(complete(colors));
    };
    img.onerror = function () {
      deferred.resolve(complete(DEFAULT));
    };
    img.src = Picture.club(idClub, saison);
    return deferred.promise;
  };

  this.initial = function (idClub) {
    return complete(idClub === 'OM' ? OM : (CORRECTIONS[idClub] || cache[idClub] || DEFAULT));
  };

});
