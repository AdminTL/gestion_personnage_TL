// Formulaire de Traitre-Lame
characterApp.controller("page_ctrl", ['$scope', '$rootScope', '$http', '$location', '$window',
  function ($scope, $rootScope, $http, $location, $window) {
    $scope.lstSection = [];
    $scope.activePage = 0;
    $scope.activeSection = 0;
    $scope.enable_facebook = true;

    $scope.user = null;

    /* ######################
     * function change page
     * ######################/
     */
    $scope.changePage = function (event, pageName) {
      var index = $scope.lstPage.indexOf(pageName);
      if (index >= 0)
        $scope.activePage = index;
      else
        console.err("Cannot find page " + pageName);
    };

    $scope.changeSection = function (event, sectionName) {
      var index = $scope.lstSection.indexOf(sectionName);
      if (index >= 0)
        $scope.activeSection = index;
      else
        console.err("Cannot find section " + sectionName);
    };

    $scope.logout = function () {
      FB.logout(function (response) {
        // Person is now logged out
      });
      // $location.url("/logout");
      $window.location.href = "/logout";
    };

    $rootScope.$on('user.login', function () {
      console.log("on user login");
      $http.defaults.headers.common.Authorization = 'Basic ' + btoa(':' + user.token());
    });

    $rootScope.$on('user.logout', function () {
      console.log("on user logout");
      $http.defaults.headers.common.Authorization = null;
    });

  }]);
