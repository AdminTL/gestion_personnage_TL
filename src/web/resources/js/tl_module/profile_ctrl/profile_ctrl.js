// Formulaire de Traitre-Lame
"use strict";

characterApp.controller("profile_ctrl", ["$scope", "$q", "$http", "$window", /*"$timeout",*/ function ($scope, $q, $http, $window) {
  $scope.model_profile = {
    info: {},

    add_password: {
      password: "",
      check_password: "",
      loading: false
    },
    update_password: {
      old_password: "",
      new_password: "",
      loading: false
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

  $scope.add_new_password = function (e) {
    // Validate request is not pending
    if ($scope.model_profile.add_password.loading) {
      return;
    }

    // Validate model field
    if ($scope.model_profile.add_password.password == "") {
      $scope.model_profile.status_password.enabled = true;
      $scope.model_profile.status_password.is_error = true;
      $scope.model_profile.status_password.text = "The password is empty.";
    } else if ($scope.model_profile.add_password.password != $scope.model_profile.add_password.check_password) {
      $scope.model_profile.status_password.enabled = true;
      $scope.model_profile.status_password.is_error = true;
      $scope.model_profile.status_password.text = "The password is not identical to the check password.";
    } else {
      var data = {
        "password": hashSha256($scope.model_profile.add_password.password)
      };

      // Send command to server
      $scope.model_profile.add_password.loading = true;
      $http({
        method: "post",
        url: "/cmd/profile/add_new_password",
        headers: {"Content-Type": "application/json; charset=UTF-8"},
        data: data,
        timeout: 5000
      }).then(function (response/*, status, headers, config*/) {
        console.debug(response.data);

        // Reset the loading
        $scope.model_profile.add_password.loading = false;
        $scope.model_profile.add_password.password = "";
        $scope.model_profile.add_password.check_password = "";

        // Show message from server
        $scope.model_profile.status_password.enabled = true;
        if ("error" in response.data) {
          $scope.model_profile.status_password.is_error = true;
          $scope.model_profile.status_password.text = response.data.error;
        } else if ("status" in response.data) {
          $scope.model_profile.status_password.is_error = false;
          $scope.model_profile.status_password.text = response.data.status;
          // Add password in info
          $scope.model_profile.info.password = true;
        } else {
          $scope.model_profile.status_password.is_error = true;
          $scope.model_profile.status_password.text = "Unknown error";
        }
      }, function errorCallback(response) {
        console.error(response);

        if (response.status == -1) {
          // Timeout
          $scope.model_profile.update_password.loading = false;
          $scope.model_profile.status_password.is_error = true;
          $scope.model_profile.status_password.text = "Timeout request.";
        } else {
          // Error from server
          $scope.model_profile.update_password.loading = false;
          $scope.model_profile.status_password.is_error = true;
          $scope.model_profile.status_password.text = "Error from server : " + response.status;
        }
      });
    }
  };

  $scope.update_password = function (e) {
    // Validate request is not pending
    if ($scope.model_profile.update_password.loading) {
      return;
    }

    // Validate model field
    if ($scope.model_profile.update_password.old_password == "" || $scope.model_profile.update_password.new_password == "") {
      $scope.model_profile.status_password.enabled = true;
      $scope.model_profile.status_password.is_error = true;
      $scope.model_profile.status_password.text = "The password is empty.";
    } else if ($scope.model_profile.update_password.old_password == $scope.model_profile.update_password.new_password) {
      $scope.model_profile.status_password.enabled = true;
      $scope.model_profile.status_password.is_error = true;
      $scope.model_profile.status_password.text = "The old password is the same of the new password.";
    } else {
      var data = {
        "old_password": hashSha256($scope.model_profile.update_password.old_password),
        "new_password": hashSha256($scope.model_profile.update_password.new_password)
      };

      // Send command to server
      $scope.model_profile.update_password.loading = true;
      $http({
        method: "post",
        url: "/cmd/profile/update_password",
        headers: {"Content-Type": "application/json; charset=UTF-8"},
        data: data,
        timeout: 5000
      }).then(function (response/*, status, headers, config*/) {
        console.debug(response.data);

        // Reset the loading
        $scope.model_profile.update_password.loading = false;
        $scope.model_profile.update_password.old_password = "";
        $scope.model_profile.update_password.new_password = "";

        // Show message from server
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
      }, function errorCallback(response) {
        console.error(response);

        if (response.status == -1) {
          // Timeout
          $scope.model_profile.update_password.loading = false;
          $scope.model_profile.status_password.is_error = true;
          $scope.model_profile.status_password.text = "Timeout request.";
        } else {
          // Error from server
          $scope.model_profile.update_password.loading = false;
          $scope.model_profile.status_password.is_error = true;
          $scope.model_profile.status_password.text = "Error from server : " + response.status;
        }
      });
    }
  };
}]);
