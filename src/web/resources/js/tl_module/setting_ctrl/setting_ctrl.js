// Formulaire de Traitre-Lame
"use strict";

characterApp.controller("setting_ctrl", ["$scope", "$q", "$http", "$window", /*"$timeout",*/ function ($scope, $q, $http, $window) {
  $scope.model_setting = {
    is_ctrl_ready: false,

    service_status: true,

    is_downloading_archive: false,
    downloading_archive: {
      status: {
        enabled: false,
        is_error: false,
        text: ""
      }
    }
  };

  $scope.database = {
    list: [],
    backup: {
      has_press_backup: false,
      label: "",
    },
    upload: {
      has_press_upload: false,
      label: "",
    }
  }

  $scope.download_archive = function () {
    window.open("/cmd/archive/generate_project", "_blank", "");
  };

  $scope.download_database = function (name) {
    let url = "/cmd/admin/download_database?name=" + name;
    window.open(url, "_blank", "");
  };

  $scope.change_status_service = function () {
    let data = {
      "status_character": !$scope.model_setting.service_status
    }
    let url = "/cmd/character_status";
    $http({
      method: "post",
      url: url,
      data: data,
      headers: {"Content-Type": "application/json; charset=UTF-8"},
      timeout: 5000
    }).then(function (response/*, status, headers, config*/) {
      console.info(response);
      $scope.model_setting.service_status = !$scope.model_setting.service_status;
    }, function errorCallback(response) {
      console.error(response);
    });
  };

  // fill user and character schema and form
  $scope.update_list_database = function () {
    let url = "/cmd/admin/editor/database";
    $http({
      method: "get",
      url: url,
      headers: {"Content-Type": "application/json; charset=UTF-8"},
      timeout: 5000
    }).then(function (response/*, status, headers, config*/) {
      console.info(response);
      $scope.database.list = response.data.lst_database;
    }, function errorCallback(response) {
      console.error(response);
    });

  };
  $scope.update_list_database();

  $scope.get_server_status = function () {
    let url = "/cmd/character_status";
    $http({
      method: "get",
      url: url,
      timeout: 5000
    }).then(function (response/*, status, headers, config*/) {
      console.info(response);
      $scope.model_setting.service_status = response.data.status_character;
    }, function errorCallback(response) {
      console.error(response);
    });
  };
  $scope.get_server_status();

  $scope.send_backup_label = function () {
    let url = "/cmd/admin/editor/backup_database";
    if ($scope.database.backup.label.length > 0) {
      url += "?label=" + $scope.database.backup.label;
    }

    $http({
      method: "get",
      url: url,
      timeout: 5000
    }).then(function (response/*, status, headers, config*/) {
      let data = response.data;
      $scope.database.list.splice(1, 0, data);
      $scope.database.backup.has_press_backup = false;
      $scope.database.backup.label = "";

    }, function errorCallback(response) {
      console.error(response);
    });
  };

  $scope.upload_backup = function () {
    var f = document.getElementById('file').files[0],
      r = new FileReader();

    r.onloadend = function (e) {
      var data = e.target.result;
      let url = "/cmd/admin/editor/upload_database";

      $http({
        method: "post",
        data: data,
        url: url,
        headers: {'Content-Type': undefined},
        timeout: 5000
      }).then(function (response/*, status, headers, config*/) {
        console.log("yeah");
        // let data = response.data;
        // $scope.database.list.splice(1, 0, data);
        // $scope.database.backup.has_press_backup = false;
        // $scope.database.backup.label = "";

      }, function errorCallback(response) {
        console.error(response);
      });
    }

    r.readAsArrayBuffer(f);


  };

}]);
