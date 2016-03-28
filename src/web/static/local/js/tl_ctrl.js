'use strict';

var characterApp = angular.module('creation_personnage_TL', ['ngRoute', 'UserApp']);

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

characterApp.controller("news_ctrl", ['$scope', function ($scope) {
  $scope.enable_facebook_news = false;
}]);

characterApp.controller("login_ctrl", ['$scope', function ($scope) {
  $scope.show_login = true;

  $scope.log_facebook = function (e) {
    console.info("login facebook");
    FB.login(function (response) {
      statusChangeCallback(response);
    }, {scope: 'public_profile,email'});
  }
}]);

characterApp.controller("character_ctrl", ['$scope', '$http', function ($scope, $http) {
  // var data_source = "http://" + window.location.host + "/update_user";
  // var socket = new SockJS(data_source);

  $scope.player = null;
  $scope.last_player = null;
  $scope.character = null;
  $scope.last_character = null;
  $scope.ddb_user = [];
  $scope.characterEdit = true;
  $scope.new_player = false;
  $scope.new_character = false;

  $scope.newPlayer = function () {
    // create empty player with empty character
    $scope.last_player = $scope.player = {};
    $scope.last_character = $scope.character = {};
    $scope.player.character = [$scope.character];

    $scope.setCharacterData(null);
    $scope.new_player = true;
  }

  $scope.newCharacter = function () {
    // create empty player with empty character
    $scope.last_character = $scope.character = {};
    $scope.character.name = "New";
    $scope.player.character.push($scope.character);
    $scope.new_character = true;
    // $scope.player.character. = [$scope.character];
  }

  $scope.deleteCharacter = function () {
    var data = Object();
    // TODO: use user id from user creation management to permission
    // data.user_id = $scope.player.id;
    data.player = $scope.player;
    data.delete_character_id = $scope.character.id;
    // TODO: need to get id if new character or player to update ddb_user
    $http.post("/cmd/character_view", data);
    $scope.player.character.remove($scope.player.character.indexOf($scope.character));
    $scope.character = null;
    // reselect new character if exist
    $scope.setCharacterData(null);
  }

  $scope.deletePlayer = function () {
    var data = Object();
    // TODO: use user id from user creation management to permission
    // data.user_id = $scope.player.id;
    data.delete_player_id = $scope.player.id;
    // TODO: need to get id if new character or player to update ddb_user
    $http.post("/cmd/character_view", data);
    $scope.ddb_user.remove($scope.ddb_user.indexOf($scope.player));
    $scope.player = null;
    $scope.character = null;
  }

  $scope.discardPlayer = function () {
    $scope.new_player = false;
    $scope.player = $scope.last_player;
    // $scope.setCharacterData(null);
  }

  $scope.discardCharacter = function () {
    $scope.new_character = false;
    $scope.character = $scope.last_character;
    // $scope.setCharacterData($scope.character);
  }

  $scope.setCharacterData = function (value) {
    if (!$scope.player) {
      // no player is selected
      $scope.last_character = $scope.character = null;
    } else if (value === null) {
      // if null, select first character
      if ($scope.player.character.length) {
        $scope.character = $scope.player.character[0];
      } else {
        // no character on this player
        $scope.lst_character = $scope.character = null;
      }
    } else {
      $scope.character = value;
    }
  }

  $scope.submitCharacterData = function () {
    var data = Object();
    // TODO: use user id from user creation management to permission
    // data.user_id = $scope.player.id;
    // TODO: don't send all character information in player
    data.player = $scope.player;
    if (isDefined($scope.character) && $scope.character && isDefined($scope.character.name)) {
      // TODO: check if contains character data in field. Only check name actually
      data.character = $scope.character;
    } else {
      $scope.character = null;
    }
    // TODO: need to get id if new character or player to update ddb_user
    $http.post("/cmd/character_view", data);
    // add to ddb_user client side if new player
    if ($scope.new_player) {
      if ($scope.character === null) {
        $scope.player.character = [];
      }
      $scope.ddb_user.push($scope.player);
      $scope.new_player = false;
    } else if (isDefined($scope.character) && $scope.character && isDefined($scope.character.name) && !$scope.player.character.length) {
      $scope.player.character.push($scope.character);
    }
    $scope.new_character = false;
  }

  $scope.printCharacterSheet = function () {
    var elem = document.getElementById('characterSheet');
    var domClone = elem.cloneNode(true);

    var printSection = document.getElementById("printSection");

    if (!printSection) {
      var printSection = document.createElement("div");
      printSection.id = "printSection";
      document.body.appendChild(printSection);
    }

    printSection.innerHTML = "<h1>Feuille de personnage</h1>";
    printSection.appendChild(domClone);

    window.print();
  }

  // socket.onmessage = function (e) {
  //   $scope.message = JSON.parse(e.data);
  //   console.log($scope.message);
  //   $scope.$apply();
  // };

  $http.get('/cmd/character_view').success(
    function (data, status, headers, config) {
      $scope.ddb_user = data;
    }
  );

  $http.get('/cmd/rule').success(
    function (data, status, headers, config) {
      $scope.rule = data;
    }
  );

}]);

characterApp.config(['$routeProvider', function ($routeProvider) {
  // $routeProvider.when('/login', {templateUrl: 'templates/login.html', login: true});
  // $routeProvider.when('/signup', {templateUrl: 'templates/signup.html', public: true});
  // $routeProvider.when('/verify-email', {templateUrl: 'partials/verify-email.html', verify_email: true});
  // $routeProvider.when('/reset-password', {templateUrl: 'partials/reset-password.html', public: true});
  // $routeProvider.when('/set-password', {templateUrl: 'partials/set-password.html', set_password: true});
  // $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1'});
  // $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
  $routeProvider.otherwise({redirectTo: '/'});
}])

characterApp.run(function ($window, user) {
  // userapp api
  user.init({appId: '56d6ef67bce81'});
  user.onAuthenticationSuccess(function () {
    console.log("Authentification réussite!");
    $window.location.href = "/";
  })
  user.getCurrent().then(function (currentUser) {
    console.log(currentUser.user_id);
  });
});
