// Formulaire de Traitre-Lame
characterApp.controller("login_ctrl", ['$scope', function ($scope) {
  $scope.show_login = true;

  $scope.log_facebook = function (e) {
    console.info("login facebook");
    FB.login(function (response) {
      statusChangeCallback(response);
    }, {scope: 'public_profile,email'});
  }
}]);
