// Formulaire de Traitre-Lame
"use strict";

characterApp.controller("editor_ctrl", ["$scope", "$q", "$http", "$window", /*"$timeout",*/ function ($scope, $q, $http, $window) {
  $scope.init_model = function (e) {
    $scope.model_editor = {
      is_ctrl_ready: false,

      module_state: {
        has_error: false,
        error: ""
      },

      info: {
        file_url: "",
        is_auth: false,
        user_has_writer_perm: false,
        has_access_perm: false,
        email_google_service: "",
        can_generate: false,
        last_local_doc_update: 0,
        string_last_local_doc_update: ""
      },

      is_updating_file_url: false,
      update_file_url: {
        status: {
          enabled: false,
          is_error: false,
          text: ""
        },
        url: ""
      },

      is_generating_doc: false,
      generated_doc: {
        status: {
          enabled: false,
          is_error: false,
          text: ""
        }
      },

      is_sharing_doc: false,
      sharing_doc: {
        status: {
          enabled: false,
          is_error: false,
          text: ""
        }
      }

    };
  };
  $scope.init_model();

  $scope.$watch("model_editor.info.last_local_doc_update", function (value) {
    var date_updated = new Date();
    date_updated.setTime(value);
    // console.debug(value);
    // console.debug(date_updated.toString());
    $scope.model_editor.info.string_last_local_doc_update = date_updated.toString();
  }, true);

  // Get editor info
  $scope.update_editor = function (e) {
    $scope.init_model();

    $http({
      method: "get",
      url: "/cmd/editor/get_info",
      headers: {"Content-Type": "application/json; charset=UTF-8"},
      timeout: 5000
    }).then(function (response/*, status, headers, config*/) {
      $scope.model_editor.info = response.data;
      console.info(response.data);
      $scope.model_editor.is_ctrl_ready = true;

      if ("error" in $scope.model_editor.info) {
        $scope.model_editor.module_state.has_error = true;
        $scope.model_editor.module_state.error = $scope.model_editor.info.error;
      }
    }, function errorCallback(response) {
      console.error(response);

      $scope.model_editor.generated_doc.status.enabled = true;
      if (response.status == -1) {
        // Timeout
        $scope.model_editor.generated_doc.status.is_error = true;
        $scope.model_editor.generated_doc.status.text = "Timeout request.";
      } else {
        // Error from server
        $scope.model_editor.generated_doc.status.is_error = true;
        $scope.model_editor.generated_doc.status.text = "Error from server : " + response.status;
      }
    });

  };
  $scope.update_editor();

  // Send request to receive writer permission
  $scope.send_writing_permission = function (e) {
    if ($scope.model_editor.is_sharing_doc) {
      return;
    }
    $scope.model_editor.sharing_doc.status.enabled = false;
    $scope.model_editor.is_sharing_doc = true;

    $http({
      method: "post",
      url: "/cmd/editor/add_generator_share",
      headers: {"Content-Type": "application/json; charset=UTF-8"},
      timeout: 5000
    }).then(function (response/*, status, headers, config*/) {
      console.info(response);
      $scope.model_editor.info.user_has_writer_perm = true;
      $scope.model_editor.is_sharing_doc = false;

      $scope.model_editor.sharing_doc.status.enabled = true;
      if ("error" in response.data) {
        $scope.model_editor.sharing_doc.status.is_error = true;
        $scope.model_editor.sharing_doc.status.text = response.data.error;
      } else if ("status" in response.data) {
        $scope.model_editor.sharing_doc.status.is_error = false;
        $scope.model_editor.sharing_doc.status.text = response.data.status;
        // Add password in info
        $scope.model_editor.info.password = true;
      } else {
        $scope.model_editor.sharing_doc.status.is_error = true;
        $scope.model_editor.sharing_doc.status.text = "Unknown error";
      }
    }, function errorCallback(response) {
      console.error(response);
      $scope.model_editor.is_sharing_doc = false;

      $scope.model_editor.sharing_doc.status.enabled = true;
      if (response.status == -1) {
        // Timeout
        $scope.model_editor.sharing_doc.status.is_error = true;
        $scope.model_editor.sharing_doc.status.text = "Timeout request.";
      } else {
        // Error from server
        $scope.model_editor.sharing_doc.status.is_error = true;
        $scope.model_editor.sharing_doc.status.text = "Error from server : " + response.status;
      }
    });
  };

  // Send request to generate documentation
  $scope.generate_doc = function (e) {
    if ($scope.model_editor.is_generating_doc) {
      return;
    }
    $scope.model_editor.generated_doc.status.enabled = false;
    $scope.model_editor.is_generating_doc = true;
    $http({
      method: "post",
      url: "/cmd/editor/generate_and_save",
      headers: {"Content-Type": "application/json; charset=UTF-8"},
      timeout: 10000
    }).then(function (response/*, status, headers, config*/) {
      console.info(response);
      $scope.model_editor.is_generating_doc = false;

      $scope.model_editor.generated_doc.status.enabled = true;
      if ("error" in response.data) {
        $scope.model_editor.generated_doc.status.is_error = true;
        $scope.model_editor.generated_doc.status.text = response.data.error;
      } else if ("status" in response.data) {
        $scope.model_editor.generated_doc.status.is_error = false;
        $scope.model_editor.generated_doc.status.text = response.data.status;
        // Add password in info
        $scope.model_editor.info.password = true;
      } else {
        $scope.model_editor.generated_doc.status.is_error = true;
        $scope.model_editor.generated_doc.status.text = "Unknown error";
      }
    }, function errorCallback(response) {
      console.error(response);
      $scope.model_editor.is_generating_doc = false;

      $scope.model_editor.generated_doc.status.enabled = true;
      if (response.status == -1) {
        // Timeout
        $scope.model_editor.generated_doc.status.is_error = true;
        $scope.model_editor.generated_doc.status.text = "Timeout request.";
      } else {
        // Error from server
        $scope.model_editor.generated_doc.status.is_error = true;
        $scope.model_editor.generated_doc.status.text = "Error from server : " + response.status;
      }
    });
  };

  // Send request to update file url
  $scope.update_file_url = function (e) {
    if ($scope.model_editor.is_updating_file_url) {
      return;
    }
    $scope.model_editor.is_updating_file_url = true;
    var data = {"file_url": $scope.model_editor.update_file_url.url}
    $http({
      method: "post",
      url: "/cmd/editor/update_file_url",
      data: data,
      headers: {"Content-Type": "application/json; charset=UTF-8"},
      timeout: 5000
    }).then(function (response/*, status, headers, config*/) {
      console.info(response);
      $scope.model_editor.is_updating_file_url = false;

      $scope.update_editor();
      $scope.model_editor.update_file_url.status.enabled = true;
      if ("error" in response.data) {
        $scope.model_editor.update_file_url.status.is_error = true;
        $scope.model_editor.update_file_url.status.text = response.data.error;
      } else if ("status" in response.data) {
        $scope.model_editor.update_file_url.status.is_error = false;
        $scope.model_editor.update_file_url.status.text = response.data.status;
      } else {
        $scope.model_editor.update_file_url.status.is_error = true;
        $scope.model_editor.update_file_url.status.text = "Unknown error";
      }
    }, function errorCallback(response) {
      console.error(response);
      $scope.model_editor.is_updating_file_url = false;

      $scope.model_editor.update_file_url.status.enabled = true;
      if (response.status == -1) {
        // Timeout
        $scope.model_editor.update_file_url.status.is_error = true;
        $scope.model_editor.update_file_url.status.text = "Timeout request.";
      } else {
        // Error from server
        $scope.model_editor.update_file_url.status.is_error = true;
        $scope.model_editor.update_file_url.status.text = "Error from server : " + response.status;
      }
    });
  };

}]);
