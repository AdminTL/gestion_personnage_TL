// Formulaire de Traitre-Lame
characterApp.controller("login_ctrl", ['$scope','$routeParams', function ($scope,$routeParams) {
  $scope.show_login = true;
  $scope.invalid_login = false;

  $scope.log_facebook = function (e) {
    console.info("login facebook");
    FB.login(function (response) {
      statusChangeCallback(response);
    }, {scope: 'public_profile,email'});
  }
}]);

characterApp.directive('uniqueField', function($http,$q) {
      var toId;
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attr, ngModel) { 
          //when the scope changes, check the field.
          scope.$watch(attr.ngModel, function(value) {
            ngModel.$asyncValidators.uniqueField = function(modelValue, viewValue) {
              var value = modelValue || viewValue;

              // Lookup field by ngModel and value
              return $http.get('http://127.0.0.1:8000/cmd/validate_auth?'+attr.ngModel+'='+value).then(
                function(response) {
                  console.log(response)
                  if (response["data"] == "0") {
                    return $q.reject("already exists");
                  }
                  return true;
                });
            };
          })
        }
      }
    });