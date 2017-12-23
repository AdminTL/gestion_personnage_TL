// Formulaire de Traitre-Lame
"use strict";

characterApp.controller("news_ctrl", ["$scope", "$http", function ($scope, $http) {
  $scope.enable_facebook_news = false;
  $scope.total_season_pass = 0;

  $http({
    method: "get",
    url: "/cmd/stat/total_season_pass",
    headers: {"Content-Type": "application/json; charset=UTF-8"},
    // data: $httpParamSerializerJQLike(data),
    timeout: 5000
  }).then(function (response/*, status, headers, config*/) {
    $scope.total_season_pass = response.data.total_season_pass_2017;
  });

}]);
