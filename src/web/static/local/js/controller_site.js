var machineApp=angular.module('creation_personnage_TL', []);

machineApp.controller("user_ctrl", ['$scope', function($scope) {
  // update_test_status is an async socket that sends the content of machine.json
  var data_source="http://" + window.location.host + "/update_user"
  var socket = new SockJS(data_source);
  
  socket.onmessage = function(e) {
    $scope.message = JSON.parse(e.data);
    console.log($scope.message);
    $scope.$apply();
  };

}]);

machineApp.controller("page_ctrl", ['$scope', function($scope) {
    $scope.lstPage = ["User"];
    $scope.lstSection = [];
    $scope.activePage = 0;
    $scope.activeSection = 0;
    $scope.showLog = false;
    $scope.showTestLogInfo = false;
}]);
