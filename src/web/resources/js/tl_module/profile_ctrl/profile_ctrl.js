// Formulaire de Traitre-Lame
"use strict";

characterApp.controller("profile_ctrl", ["$scope", "$q", "$http", "$window", /*"$timeout",*/ function ($scope, $q, $http, $window) {
  $scope.model_profile = {
    info: {},
    add_password: {
      old_password: "",
      new_password: ""
    },
    update_password: {
      password: "",
      check_password: ""
    },
    status_password: {
      text: "",
      enabled: true,
      is_error: false
    }
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
    if ($scope.model_profile.add_password.old_password != "" && $scope.model_profile.add_password.new_password) {
      var data = {
        "old_password": hashSha256($scope.model_profile.add_password.old_password),
        "new_password": hashSha256($scope.model_profile.add_password.new_password)
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
        $scope.model_profile.add_password.old_password = "";
        $scope.model_profile.add_password.new_password = "";

        $scope.model_profile.status_password.enabled = true;
        if ("error" in response.data) {
          $scope.model_profile.status_password.is_error = true;
          $scope.model_profile.status_password.text = response.data.error;
        } else if ("status" in response.data) {
          $scope.model_profile.status_password.is_error = false;
          $scope.model_profile.status_password.text = response.data.status;
        } else {
          $scope.model_profile.status_password.is_error = true;
          $scope.model_profile.status_password.text = "Unknown error";
        }
      });
    }
  };

  $scope.add_new_password = function (e) {
    if ($scope.model_profile.update_password.password != "" &&
      $scope.model_profile.update_password.password == $scope.model_profile.update_password.check_password) {

      var data = {
        "password": hashSha256($scope.model_profile.update_password.password)
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
        $scope.model_profile.update_password.password = "";
        $scope.model_profile.update_password.check_password = "";

        $scope.model_profile.status_password.enabled = true;
        if ("error" in response.data) {
          $scope.model_profile.status_password.is_error = true;
          $scope.model_profile.status_password.text = response.data.error;
        } else if ("status" in response.data) {
          $scope.model_profile.status_password.is_error = false;
          $scope.model_profile.status_password.text = response.data.status;
        } else {
          $scope.model_profile.status_password.is_error = true;
          $scope.model_profile.status_password.text = "Unknown error";
        }

        // Update profile to change view
        $scope.update_profile();
      });
    }
  };
}]);
