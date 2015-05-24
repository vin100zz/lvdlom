app.directive('lvdlomFormat', function ($compile) {
  var linker = function (scope, element, attrs) {
    var output = scope.value;
    if (scope.formatter) {
      output = scope.formatter.call(this, typeof scope.value !== 'undefined' ? scope.value : scope.item);
    }
    var el = $compile('<div>' + output + '</div>')(scope);
    element.append(el);
  };
  
  return {
    scope: {
      formatter: '=',
      value: '=',
      item: '='
    },
    link: linker
  };
});