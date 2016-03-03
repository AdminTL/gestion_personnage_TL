'use strict';

var characterApp = angular.module('creation_personnage_TL', []);

characterApp.controller("page_ctrl", ['$scope', '$http', '$location', '$window', function ($scope, $http, $location, $window) {
  $scope.lstPage = ["Nouvelle", "Personnage", "Admin", "Connexion"];
  $scope.lstPermPage = [0, 1, 2, 0];
  $scope.lstStylePage = [, , , "color:#FF4E00;"];
  $scope.lstSection = [];
  $scope.activePage = 0;
  $scope.activeSection = 0;
  $scope.enable_facebook = true;

  $scope.user = null;

  /* ######################
   * function change page
   * ######################/
   */
  $scope.changePage = function (event, pageName) {
    var index = $scope.lstPage.indexOf(pageName);
    if (index >= 0)
      $scope.activePage = index;
    else
      console.err("Cannot find page " + pageName);
  };

  $scope.changeSection = function (event, sectionName) {
    var index = $scope.lstSection.indexOf(sectionName);
    if (index >= 0)
      $scope.activeSection = index;
    else
      console.err("Cannot find section " + sectionName);
  };

  $scope.logout = function () {
    FB.logout(function (response) {
      // Person is now logged out
    });
    // $location.url("/logout");
    $window.location.href = "/logout";
  }
}]);

characterApp.controller("news_ctrl", ['$scope', function ($scope) {
  $scope.enable_facebook_news = false;
}]);

characterApp.controller("login_ctrl", ['$scope', function ($scope) {
  $scope.show_login = true;

  $scope.log_facebook = function (e) {
    console.info("login facebook");
    FB.login(function (response) {
      statusChangeCallback(response);
    }, {scope: 'public_profile,email'});
  }
}]);

characterApp.controller("character_ctrl", ['$scope', '$http', function ($scope, $http) {
  // update_test_status is an async socket that sends the content of machine.json
  var data_source = "http://" + window.location.host + "/update_user";
  var socket = new SockJS(data_source);
  var ddb = {};

  socket.onmessage = function (e) {
    $scope.message = JSON.parse(e.data);
    console.log($scope.message);
    $scope.$apply();
  };

  $http.get('/cmd/character_view').success(
    function (data, status, headers, config) {
      $scope.ddb = data;
    }
  );
}]);
