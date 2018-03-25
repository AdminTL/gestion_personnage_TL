// Formulaire de Traitre-Lame
"use strict";

characterApp.controller("profile_ctrl", ["$scope", "$q", "$http", "$window", /*"$timeout",*/ function ($scope, $q, $http, $window) {
  $scope.model_profile = {
    info: {}
  };

  $scope.dct_profile_password = {
    "old_password": "",
    "new_password": ""
  };

  $scope.dct_profile_new_password = {
    "password": "",
    "check_password": ""
  };

  // Get profile info
  $scope.update_profile = function (e) {
    $http({
      method: "get",
      url: "/cmd/profile/get_info",
      headers: {"Content-Type": "application/json; charset=UTF-8"},
      timeout: 5000
    }).then(function (response/*, status, headers, config*/) {
      $scope.model_profile.info = response.data;
    });

  };
  $scope.update_profile();

  $scope.save_password = function (e) {
    if ($scope.dct_profile_password.old_password != "" && $scope.dct_profile_password.new_password) {
      var data = {
        "old_password": hashSha256($scope.dct_profile_password.old_password),
        "new_password": hashSha256($scope.dct_profile_password.new_password)
      };
      // send command to server
      $http({
        method: "post",
        url: "/cmd/profile/update_password",
        headers: {"Content-Type": "application/json; charset=UTF-8"},
        data: data,
        timeout: 5000
      }).then(function (response/*, status, headers, config*/) {
        console.info(response.data);
        $scope.dct_profile_password.old_password = "";
        $scope.dct_profile_password.new_password = "";
      });
    }
  };

  $scope.add_new_password = function (e) {
    if ($scope.dct_profile_new_password.password != "" && $scope.dct_profile_new_password.password == $scope.dct_profile_new_password.check_password) {
      var data = {
        "password": hashSha256($scope.dct_profile_new_password.password)
      };
      // send command to server
      $http({
        method: "post",
        url: "/cmd/profile/add_new_password",
        headers: {"Content-Type": "application/json; charset=UTF-8"},
        data: data,
        timeout: 5000
      }).then(function (response/*, status, headers, config*/) {
        console.info(response.data);
        $scope.dct_profile_new_password.password = "";
        $scope.dct_profile_new_password.check_password = "";
        // Update profile to change view
        $scope.update_profile();
      });
    }
  };
}]);
