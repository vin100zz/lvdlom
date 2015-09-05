/* exported AbstractModuleCtrl */
var AbstractModuleCtrl = function ($scope, pageTitle) {

  $scope.setPageTitle = function (title) {
    title = (title || '').trim();
    window.document.title = 'La Vie de l\'OM' + (title ? ' \u25aa\u25aa ' + title : '');
  };

  $scope.setPageTitle(pageTitle);

};