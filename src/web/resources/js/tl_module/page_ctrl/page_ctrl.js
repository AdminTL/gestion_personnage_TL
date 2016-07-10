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

    $scope.isActive = function (viewLocation) {
      // bug : $location.path() is not configure and shoot wrong information
      // return viewLocation === $location.path();
      // use home patch
      var v_loc;
      if (viewLocation.indexOf("#/") > 0) {
        v_loc = viewLocation.substring(0, viewLocation.length - 2);
      } else {
         v_loc = viewLocation;
      }
      return window.location.pathname.length == v_loc.length && $location.$$absUrl.indexOf(window.location.pathname) > -1;
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
