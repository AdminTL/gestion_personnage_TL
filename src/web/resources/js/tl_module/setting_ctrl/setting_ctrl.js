// Formulaire de Traitre-Lame
"use strict";

characterApp.controller("setting_ctrl", ["$scope", "$q", "$http", "$window", /*"$timeout",*/ function ($scope, $q, $http, $window) {
  $scope.model_setting = {
    is_ctrl_ready: false,

    is_downloading_archive: false,
    downloading_archive: {
      status: {
        enabled: false,
        is_error: false,
        text: ""
      }
    }
  };

  $scope.download_archive = function () {
    window.open("/cmd/archive/generate_project", "_blank", "");
  }
}]);
