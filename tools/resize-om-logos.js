/**
 * Génère les versions "small" (max 18px hauteur) des logos OM d'époque
 * depuis style/clubs/large/om/ vers style/clubs/small/
 * Nommage : om-YEAR.png  (ex: om-1899.png)
 */

'use strict';

var fs   = require('fs');
var path = require('path');
var PNG  = require('pngjs').PNG;

var MAX_HEIGHT = 18;

var ERAS = ['1899','1910','1935','1972','1981','1986','1990','1996','1998','1999','2004','2026'];

var srcDir  = path.join(__dirname, '..', 'style', 'clubs', 'large', 'om');
var destDir = path.join(__dirname, '..', 'style', 'clubs', 'small');

/**
 * Rééchantillonnage bilinéaire
 */
function resizeBilinear(src, srcW, srcH, dstW, dstH) {
  var dst = new Uint8Array(dstW * dstH * 4);
  var xRatio = srcW / dstW;
  var yRatio = srcH / dstH;

  for (var y = 0; y < dstH; y++) {
    for (var x = 0; x < dstW; x++) {
      var srcX = x * xRatio;
      var srcY = y * yRatio;
      var x0 = Math.floor(srcX);
      var y0 = Math.floor(srcY);
      var x1 = Math.min(x0 + 1, srcW - 1);
      var y1 = Math.min(y0 + 1, srcH - 1);
      var fx = srcX - x0;
      var fy = srcY - y0;

      for (var c = 0; c < 4; c++) {
        var p00 = src[(y0 * srcW + x0) * 4 + c];
        var p10 = src[(y0 * srcW + x1) * 4 + c];
        var p01 = src[(y1 * srcW + x0) * 4 + c];
        var p11 = src[(y1 * srcW + x1) * 4 + c];
        var val = p00 * (1 - fx) * (1 - fy) +
                  p10 * fx       * (1 - fy) +
                  p01 * (1 - fx) * fy       +
                  p11 * fx       * fy;
        dst[(y * dstW + x) * 4 + c] = Math.round(val);
      }
    }
  }
  return dst;
}

function processEra(era, callback) {
  var srcFile  = path.join(srcDir, era + '.png');
  var destFile = path.join(destDir, 'om-' + era + '.png');

  var data = fs.readFileSync(srcFile);
  var src  = PNG.sync.read(data);

  var srcW = src.width;
  var srcH = src.height;

  // Redimensionne proportionnellement avec hauteur max = MAX_HEIGHT
  var dstH = MAX_HEIGHT;
  var dstW = Math.max(1, Math.round(srcW * dstH / srcH));

  console.log(era + '.png : ' + srcW + 'x' + srcH + ' -> ' + dstW + 'x' + dstH);

  var resized = resizeBilinear(src.data, srcW, srcH, dstW, dstH);

  var out = new PNG({ width: dstW, height: dstH });
  out.data = Buffer.from(resized);

  var buf = PNG.sync.write(out);
  fs.writeFileSync(destFile, buf);
  console.log('  -> écrit : ' + destFile);

  callback();
}

var index = 0;
function next() {
  if (index >= ERAS.length) {
    console.log('\nTerminé ! ' + ERAS.length + ' logos générés dans ' + destDir);
    return;
  }
  processEra(ERAS[index++], next);
}

next();

