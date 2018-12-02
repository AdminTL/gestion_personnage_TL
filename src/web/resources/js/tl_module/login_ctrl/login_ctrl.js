// Formulaire de Traitre-Lame
characterApp.controller("login_ctrl", ["$scope", "$routeParams", "$window", function ($scope, $routeParams, $window) {
  $scope.show_login = !($window.location.search.indexOf("?subscribe") >= 0);
  $scope.invalid_login = false;

  $scope.log_facebook = function (e) {
    console.info("login facebook");
    FB.login(function (response) {
      statusChangeCallback(response);
    }, {scope: 'public_profile,email'});
  };
}]);

characterApp.directive('uniqueField', function ($http, $q) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, elem, attr, ngModel) {
      // When the scope changes, check the field.
      scope.$watch(attr.ngModel, function (value) {
        ngModel.$asyncValidators.uniqueField = function (modelValue, viewValue) {
          var value = modelValue || viewValue;

          // TODO add delay request, 1 second

          // Lookup field by ngModel and value
          return $http({
            method: "get",
            url: '/cmd/auth/validate?' + attr.ngModel + '=' + value,
            //headers: {"Content-Type": "application/json; charset=UTF-8"},
            timeout: 5000
          }).then(
            function (response) {
              if (response["data"] == "0") {
                return $q.reject("Already exists");
              } else if (response["data"] == "1") {
                return true;
              } else {
                return $q.reject("Unknown response.");
              }
            });
        };
      })
    }
  }
});


characterApp.directive('fieldMatch', function () {
  return {
    require: 'ngModel',
    link: function (scope, elem, attr, ngModel) {
      ngModel.$parsers.unshift(validate);

      // Force-trigger the parsing pipeline.
      scope.$watch(attr.fieldMatch, function () {
        validate(ngModel.$viewValue);
      });

      function validate(value) {
        var isValid = scope.$eval(attr.fieldMatch) == value;
        ngModel.$setValidity('fieldMatch', isValid);
        return isValid ? value : undefined;
      }
    }
  };
});
