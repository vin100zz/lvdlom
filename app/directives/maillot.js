app.directive('lvdlomMaillot', function (Maillots) {
  
  // RGB -> HSV
  function rgb2hsv (r, g, b) {
    r = r/255; g = g/255; b = b/255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min){
        h = 0; // achromatic
    } else {
        switch (max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, s, v];
  }
  
  // HSV -> RGB
  function hsv2rgb (h, s, v) {
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch (i % 6){
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }

    return [r * 255, g * 255, b * 255];
  }
  
  // Hex -> RGB
  function hex2rgb (hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
  }
  
  // load image in canvas
  function loadImgInCanvas (id, source, cb) {
    var canvas = document.getElementById(id);
    var context = canvas.getContext('2d');    

    var img = new Image();
    img.src = source;
    img.onload = function () {
      context.drawImage(img, 0, 0);
      cb(canvas, context, img);
    };
  }
  
  // change color
  function changeColor (to) {
    return hex2rgb(to);
  }
  
  // change colors
  function changeColors (data, color1, color2, color3) {
    for (var p=0; p<data.length; p+=4) {
      var r = data[p];
      var g = data[p+1];
      var b = data[p+2];
      var a = data[p+3];
      var to = null;
      
      if (a > 0) {
        if (r>=g && r>=b) {
          to = color1;
        } else if (g>=r && g>=b) {
          to = color2;
        } else {
          to = color3;
        }
        var rgb = changeColor(to);
        
        data[p] = rgb[0];
        data[p+1] = rgb[1];
        data[p+2] = rgb[2];
      }
    }
  }
  
  // superimpose template
  function superimposeTemplate (id, tplData) {
    var canvas = document.getElementById(id);
    var context = canvas.getContext('2d');
    var map = context.getImageData(0, 0, canvas.width, canvas.height);
    var data = map.data;
    for (var p=0; p<tplData.length; p+=4) {
      var r = data[p];
      var g = data[p+1];
      var b = data[p+2];
      var a = data[p+3];

      if (a === 0) {
        data[p] = tplData[p];
        data[p+1] = tplData[p+1];
        data[p+2] = tplData[p+2];
        data[p+3] = tplData[p+3];
      } else {
        var hsv = rgb2hsv(r,g,b);
        var h = hsv[0];
        var s = hsv[1];
        var v = hsv[2];
        
        v = Math.max(0, v + tplData[p] / 255 - 1);
        
        var rgb = hsv2rgb(h, s, v);
        
        data[p] = rgb[0];
        data[p+1] = rgb[1];
        data[p+2] = rgb[2];
      }    
    }
    context.putImageData(map, 0, 0);
  }
  
  return {
    scope: {
      cfg: '='
    },
    templateUrl: 'app/directives/maillot.html',
    controller: function ($scope) {
      
      var render = function () {
        if (!$scope.cfg) {
          return;
        }
        
        if ($scope.canvasCfg) {
          var oldCanvas = document.getElementById($scope.canvasCfg.canvasId);
          oldCanvas.getContext('2d').clearRect(0, 0, oldCanvas.width, oldCanvas.height);
        }
        
        if ($scope.cfg.nomClub !== 'OM') {

          $scope.canvasCfg = $scope.cfg.debug ? $scope.cfg.debug : JSON.parse(JSON.stringify(Maillots.get($scope.cfg.idClub, $scope.cfg.nomClub)));
          
          loadImgInCanvas('template', 'style/maillots/effect.png', function (tplCanvas, tplContext, tplImg) {
            
            var tplMap = tplContext.getImageData(0, 0, tplCanvas.width, tplCanvas.height);
            var tplData = tplMap.data;
            
            loadImgInCanvas($scope.canvasCfg.canvasId, 'style/maillots/' + $scope.canvasCfg.template + '.png', function (canvas, context, img) {
     
              var map = context.getImageData(0, 0, canvas.width, canvas.height);
              var data = map.data;
  
              // change colors
              changeColors(data, $scope.canvasCfg.color1, $scope.canvasCfg.color2, $scope.canvasCfg.color3);
              context.putImageData(map, 0, 0);
              
              img.onload = null;
              img.src = canvas.toDataURL();
              
              // blur image
              stackBlurCanvasRGB($scope.canvasCfg.canvasId, 0, 0, 210, 210, 3);
              
              // superimpose template
              superimposeTemplate($scope.canvasCfg.canvasId, tplData);
            });           
          });
        }
      };
      
      render();
      
      $scope.$watch('cfg.nomClub', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          render();
        }
      }, true);
    }
  };
});
 
 

      
