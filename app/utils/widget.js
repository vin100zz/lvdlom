app.service('Widget', function() {
  
  this.restrictTypeahead = function (container, node, dictionary) {
    var valid = true;
    if (typeof container[node] === 'string') {
      valid  = false;
    } else {
      valid = !!dictionary.find(function (item) {
        return item.key === container[node].key;
      });
    }

    if (!valid) {
      container[node] = null;
    }
  };

});