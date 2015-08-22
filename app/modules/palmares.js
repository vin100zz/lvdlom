(function () {
  
  'use strict';
  
  // API
  app.factory('Palmares', function ($resource) {
    return $resource('services/palmares.php', {}, {
      get: {method: 'GET', isArray: true, cache: false}
    });
  });
  
  // controller
  app.controller('PalmaresCtrl', function($scope, $routeParams, Palmares) {
    
    $scope.chartCfg = [
      {title: 'Championnat', icon: 'flag-o', height: 800},
      {title: 'Coupes d\'Europe', icon: 'trophy', height: 300},
      {title: 'Coupe de France', icon: 'trophy', height: 300},
      {title: 'Autres coupes nationales', icon: 'trophy', height: 300},
    ];
    
    $scope.drawHisto = function (yAxis, source, containerId, height) {
      
      // ticks
      var ticks = [];
      for (var i in yAxis) {
        if(yAxis.hasOwnProperty(i)) {
          ticks.push({v: yAxis[i].Value, f: yAxis[i].Label});
        }
      }
      
      // data
      var data = [];
      for (var saison in source[0].Histo) {
        if(source[0].Histo.hasOwnProperty(saison)) {
          var row = [saison];
          for (i = 0; i < source.length; ++i) {
            row.push(source[i].Histo[saison].Niveau);
            row.push($scope.tooltip(saison, source[i].Matches));
          }
          data.push(row);
        }
      }
      
      // datatable
      var dataTable = new google.visualization.DataTable();
      dataTable.addColumn('string', 'Saison');
      for (i = 0; i < source.length; ++i) {
        dataTable.addColumn('number', source[i].Nom);
        dataTable.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
      }
      dataTable.addRows(data);
      
      
      var content = document.getElementById('content');
      var width = content.offsetWidth - 75;
      
      var textStyle = {fontName: 'Lvdlom', fontSize: 12};
      
      // options
      var options = {
        width: width,
        height: height,
        chartArea: {top: 20, left : 130, width: width - 325, height: height-100},
        lineSize: 0,
        pointSize: 9,
        colors : ['#2196f3', '#009688', '#cddc39', '#3f51b5'],
        tooltip: {isHtml : true},
        legend: {
          textStyle: textStyle
        },
        hAxis : {
          slantedText : true,
          slantedTextAngle : 90,
          allowContainerBoundaryTextCufoff : true,
          textStyle: textStyle
        },
        vAxis : {
          baseline : yAxis.length+1,
          direction : -1,
          ticks : ticks,
          textStyle: textStyle
        }
      };
      
      // chart
      var container = document.getElementById(containerId);
      var chart = new google.visualization.AreaChart(container);
      google.visualization.events.addListener(chart, 'ready', $scope.hackChart);
      chart.draw(dataTable, options);
    };
    
    $scope.hackChart = function () {
      // Championnat
      $scope.addCss('#chart0 svg > g:nth-of-type(2) > g > g > rect:nth-of-type(14)', ['line', 'transition-d1-d2']);
      $scope.addCss('#chart0 svg > g:nth-of-type(2) > g > g > rect:nth-of-type(34)', ['line', 'titre']);
      $scope.addCss('#chart0 svg > g:nth-of-type(2) > g > g > rect:nth-of-type(33)', ['line', 'finale']);
      
      $scope.addCss('#chart0 svg > g:nth-of-type(2) > g:nth-of-type(3) > g:nth-of-type(82) > text', ['label', 'titre']);
      $scope.addCss('#chart0 svg > g:nth-of-type(2) > g:nth-of-type(3) > g:nth-of-type(81) > text', ['label', 'finale']);
      
      // Coupes d'Europe
      $scope.addCss('#chart1 svg > g:nth-of-type(2) > g > g > rect:nth-of-type(9)', ['line', 'titre']);
      $scope.addCss('#chart1 svg > g:nth-of-type(2) > g > g > rect:nth-of-type(8)', ['line', 'finale']);
      
      $scope.addCss('#chart1 svg > g:nth-of-type(2) > g:nth-of-type(3) > g:nth-of-type(57) > text', ['label', 'titre']);
      $scope.addCss('#chart1 svg > g:nth-of-type(2) > g:nth-of-type(3) > g:nth-of-type(56) > text', ['label', 'finale']);
      
      // Coupe de France
      $scope.addCss('#chart2 svg > g:nth-of-type(2) > g > g > rect:nth-of-type(8)', ['line', 'titre']);
      $scope.addCss('#chart2 svg > g:nth-of-type(2) > g > g > rect:nth-of-type(7)', ['line', 'finale']);
      
      $scope.addCss('#chart2 svg > g:nth-of-type(2) > g:nth-of-type(3) > g:nth-of-type(56) > text', ['label', 'titre']);
      $scope.addCss('#chart2 svg > g:nth-of-type(2) > g:nth-of-type(3) > g:nth-of-type(55) > text', ['label', 'finale']);
      
      // Autres coupes nationales
      $scope.addCss('#chart3 svg > g:nth-of-type(2) > g > g > rect:nth-of-type(8)', ['line', 'titre']);
      $scope.addCss('#chart3 svg > g:nth-of-type(2) > g > g > rect:nth-of-type(7)', ['line', 'finale']);
      
      $scope.addCss('#chart3 svg > g:nth-of-type(2) > g:nth-of-type(3) > g:nth-of-type(56) > text', ['label', 'titre']);
      $scope.addCss('#chart3 svg > g:nth-of-type(2) > g:nth-of-type(3) > g:nth-of-type(55) > text', ['label', 'finale']);
    };
    
    $scope.addCss = function (selector, cssList) {
      var elements = document.querySelectorAll(selector) || [];
      Array.prototype.forEach.call(elements, function (element) {
        cssList.forEach(function (css) {
          element.classList.add(css);
        });
      });
    };

    $scope.tooltip = function (saison, matches) {
      var adv = matches[saison] ? matches[saison].join('<br/>') : '';
      
      var tooltip = '<div class="chartTooltip">';
      tooltip += '<div class="minititle">' + saison + '</div>';
      tooltip += adv;
      tooltip += '</div>';
      return tooltip;
    };

    
    Palmares.get(null, function (chartsData) {
      
      chartsData.forEach(function (chartData, index) {
        $scope.drawHisto(chartData.niveaux, chartData.competitions, 'chart' + index, $scope.chartCfg[index].height);
      });

    });
  });
  
}) ();