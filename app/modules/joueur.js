'use strict';

// API
app.factory('Joueur', function ($resource) {
  return $resource('services/joueur.php', {}, {
    get: {method: 'GET', isArray: false, cache: true}
  });
});

// controller
app.controller('JoueurCtrl', function($scope, $routeParams, Joueur) {
  $scope.joueur = Joueur.get({id: $routeParams.id});
  
  /**
   * Converts an RGB color value to HSV. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
   * Assumes r, g, and b are contained in the set [0, 255] and
   * returns h, s, and v in the set [0, 1].
   *
   * @param   Number  r       The red color value
   * @param   Number  g       The green color value
   * @param   Number  b       The blue color value
   * @return  Array           The HSV representation
   */
  function rgb2hsv(r, g, b){
      r = r/255, g = g/255, b = b/255;
      var max = Math.max(r, g, b), min = Math.min(r, g, b);
      var h, s, v = max;

      var d = max - min;
      s = max == 0 ? 0 : d / max;

      if(max == min){
          h = 0; // achromatic
      }else{
          switch(max){
              case r: h = (g - b) / d + (g < b ? 6 : 0); break;
              case g: h = (b - r) / d + 2; break;
              case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
      }

      return [h, s, v];
  }

  /**
   * Converts an HSV color value to RGB. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
   * Assumes h, s, and v are contained in the set [0, 1] and
   * returns r, g, and b in the set [0, 255].
   *
   * @param   Number  h       The hue
   * @param   Number  s       The saturation
   * @param   Number  v       The value
   * @return  Array           The RGB representation
   */
  function hsv2rgb(h, s, v){
      var r, g, b;

      var i = Math.floor(h * 6);
      var f = h * 6 - i;
      var p = v * (1 - s);
      var q = v * (1 - f * s);
      var t = v * (1 - (1 - f) * s);

      switch(i % 6){
          case 0: r = v, g = t, b = p; break;
          case 1: r = q, g = v, b = p; break;
          case 2: r = p, g = v, b = t; break;
          case 3: r = p, g = q, b = v; break;
          case 4: r = t, g = p, b = v; break;
          case 5: r = v, g = p, b = q; break;
      }

      return [r * 255, g * 255, b * 255];
  }
  
  setTimeout(function () {
    var canvas2 = document.getElementById('aaa');
    var context2 = canvas2.getContext("2d");    
    

    var img2 = new Image();
    img2.src = "style/maillots/effect.png";
    
    img2.onload = function () {
      
      context2.drawImage(img2, 0, 0);
      
      var map2 = context2.getImageData(0, 0, canvas2.width, canvas2.height);
      var data2 = map2.data;
      
      var canvas = document.getElementById('bbb');
      var context = canvas.getContext("2d");    
      
      var img = new Image();
      img.src = "style/maillots/3.png";
      
      img.onload = function () {
        
        context.drawImage(img, 0, 0);
        
        var map = context.getImageData(0, 0, canvas.width, canvas.height);
        var data = map.data;
              
        for (var p=0; p<data.length; p+=4) {
          var r = data[p];
          var g = data[p+1];
          var b = data[p+2];
          var a = data[p+3];
          
          /*if (r>=g && r>=b) {
            r = 255;
            g = 0;
            b = 0;
          }
          if (g>=r && g>=b) {
            r = 0;
            g = 255;
            b = 0;
          }
          if (b>=g && b>=r) {
            r = 0;
            g = 0;
            b = 255;
          }*/
          
          if (a > 0) {
            var hsv = rgb2hsv(r,g,b);
            var h = hsv[0];
            var s = hsv[1];
            var v = hsv[2];
            
            h += 0.9 % 1;
                        
            v = Math.max(0, v + data2[p] / 255 - 1);
            
            var rgb = hsv2rgb(h, s, v);
            
            data[p] = rgb[0];
            data[p+1] = rgb[1];
            data[p+2] = rgb[2];
          }
        }
        
        context.putImageData(map, 0, 0);
        
        img.onload = null;
        img.src = canvas.toDataURL();
      }
      
      
    }
    
   
    


  }, 500);
});




