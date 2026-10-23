app.directive('lvdlomMaillot', function (Maillots, Picture, ClubColors) {

  // gabarits de style/maillots (tools/maillots.py) : le rouge, le vert et le bleu marquent
  // les trois couleurs du maillot, leur intensité porte l'ombre du tissu
  var SIZE = 420;

  // OM : maillot blanc uni
  var OM = {template: 1, color1: 'FFFFFF', color2: 'FFFFFF', color3: 'FFFFFF'};

  // Hex -> RGB
  function hex2rgb (hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
  }

  // chaque zone primaire prend sa couleur ; la part neutre (le plus faible des trois canaux)
  // garde les coutures et les reflets du tissu
  function recolor (data, colors) {
    for (var p = 0; p < data.length; p += 4) {
      if (data[p + 3] === 0) {
        continue;
      }
      var neutral = Math.min(data[p], data[p + 1], data[p + 2]);
      var r = data[p] - neutral;
      var g = data[p + 1] - neutral;
      var b = data[p + 2] - neutral;
      for (var c = 0; c < 3; c++) {
        data[p + c] = neutral + (r * colors[0][c] + g * colors[1][c] + b * colors[2][c]) / 255;
      }
    }
  }

  return {
    scope: {
      cfg: '='
    },
    templateUrl: 'app/directives/maillot.html',
    controller: function ($scope, $element) {
      var pending = null;

      var render = function () {
        var request = {};
        pending = request;
        if (!$scope.cfg) {
          return;
        }
        var om = $scope.cfg.nomClub === 'OM';
        var cfg = $scope.cfg.debug || (om ? OM : Maillots.get($scope.cfg.idClub, $scope.cfg.nomClub));
        $scope.ecusson = om ? ($scope.cfg.saison ? Picture.club('OM', $scope.cfg.saison) : null) : 'style/clubs/large/' + $scope.cfg.idClub + '.png';

        // Seul le dernier maillot demandé est dessiné, même si les couleurs ou images arrivent dans le désordre.
        var draw = function (config) {
          if (request !== pending) {
            return;
          }
          var img = new Image();
          img.onload = function () {
            if (request !== pending) {
              return;
            }
            var canvas = $element[0].querySelector('canvas');
            var context = canvas.getContext('2d');
            context.clearRect(0, 0, SIZE, SIZE);
            context.drawImage(img, 0, 0, SIZE, SIZE);
            var map = context.getImageData(0, 0, SIZE, SIZE);
            recolor(map.data, [hex2rgb(config.color1), hex2rgb(config.color2), hex2rgb(config.color3)]);
            context.putImageData(map, 0, 0);
          };
          img.src = 'style/maillots/' + config.template + '.png';
        };
        if (cfg) {
          draw(cfg);
        } else {
          ClubColors.get($scope.cfg.idClub, $scope.cfg.saison).then(function (colors) {
            draw({template: 1, color1: colors.bg, color2: colors.accent, color3: colors.accent});
          });
        }
      };

      $scope.$on('$destroy', function () {
        pending = null;
      });

      render();

      $scope.$watch('cfg', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          render();
        }
      }, true);
    }
  };
});
