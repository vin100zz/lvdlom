app.service('DateTime', function ($filter) {
  
  this.format = function (date, format) {
    var formatted = $filter('date')(date, format);
    if (formatted && formatted.indexOf('1 ') === 0) {
      formatted = '1er ' + formatted.substr(2);
    }
    return formatted;
  };

});