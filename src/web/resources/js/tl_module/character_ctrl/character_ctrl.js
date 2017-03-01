// Formulaire de Traitre-Lame
"use strict";

characterApp.controller("character_ctrl", ["$scope", "$q", "$http", "$window", /*"$timeout",*/ function ($scope, $q, $http, $window) {
  // var data_source = "http://" + window.location.host + "/update_user";
  // var socket = new SockJS(data_source);
  $scope.is_admin = "/admin" == $window.location.pathname;

  $scope.isMobile = function () {
    return $scope.$parent.active_style == 'Petite personne';
  };

  // todo move this variable in json
  $scope.xp_default = 6;
  $scope.xp_bogue = 5;

  $scope.html_qr_code = "";
  $scope.url_qr_code = "";

  $scope.player = null;
  $scope.last_player = null;
  $scope.character = null;
  $scope.last_character = null;
  $scope.ddb_user = [];
  $scope.characterEdit = true;
  $scope.new_player = false;
  $scope.new_character = false;

  $scope.model_user = {};
  $scope.schema_user = {};
  $scope.form_user = [];

  $scope.model_char = {};
  $scope.schema_char = {};
  $scope.form_char = [];

  // fill user and character schema and form
  TL_Schema($scope);

  $scope.onSubmit = function (form) {
    // First we broadcast an event so all fields validate themselves
    $scope.$broadcast('schemaFormValidate');

    // Then we check if the form is valid
    if (form.$valid) {
      var data = {};
      data.player = $scope.model_user;
      data.character = $scope.model_char;
      $http({
        method: "post",
        url: "/cmd/character_view",
        headers: {"Content-Type": "application/json; charset=UTF-8"},
        data: data,
        timeout: 5000
      });
      // TODO not suppose to need to reload the page, block by socket update
      $window.location.reload();
    }
  };

  $scope.$watch("model_user", function (value) {
    if (value) {
      $scope.prettyModelUser = JSON.stringify(value, undefined, 2);
    }
    // todo : update player
    // $scope.player = value;
  }, true);

  $scope.$watch("model_char", function (value) {
    if (value) {
      $scope.prettyModelChar = JSON.stringify(value, undefined, 2);
    }
    // todo : update player
    // $scope.player = value;
  }, true);

  $scope.$watch("player", function (value) {
    if (!value) {
      return;
    }
    $scope.prettyPlayer = JSON.stringify(value, undefined, 2);
    // update model information
    $scope.model_user = filterIgnore(value, ["$$hashKey", "character"]);
    // var first_id;
    // for(first_id in $scope.model_user.character) break;
    // $scope.model_char = $scope.model_user.character[first_id];
    // TODO put xp default in json configuration file
    // TODO need to find right id character, and not taking first!
    if (isDefined(value.character)) {
      var firstChar = value.character[0];
      $scope.model_char = filterIgnore(firstChar, ["$$hashKey"]);

      // TODO need to feel empty field
      if (!isDefined(firstChar.habilites)) {
        $scope.model_char.habilites = [{}];
      }
      if (!isDefined(firstChar.technique_maitre)) {
        $scope.model_char.technique_maitre = [];
      }
      if (!isDefined(firstChar.rituel)) {
        $scope.model_char.rituel = [];
      }
      if (!isDefined(firstChar.xp_naissance)) {
        $scope.model_char.xp_naissance = $scope.xp_bogue;
      }
      if (!isDefined(firstChar.xp_autre)) {
        $scope.model_char.xp_autre = 0;
      }
    } else {
      $scope.model_char = {};
      $scope.model_char.habilites = [{}];
      $scope.model_char.technique_maitre = [];
      $scope.model_char.rituel = [];
      $scope.model_char.xp_naissance = $scope.xp_bogue;
      $scope.model_char.xp_autre = 0;
    }
    $scope.get_html_qr_code();
  }, true);

  $scope.newPlayer = function () {
    // create empty player with empty character
    $scope.last_player = $scope.player = {};
    $scope.last_character = $scope.character = {};
    $scope.player.character = [$scope.character];

    $scope.setCharacterData(null);
    $scope.new_player = true;
  };

  $scope.newCharacter = function () {
    // create empty player with empty character
    $scope.last_character = $scope.character = {};
    $scope.character.name = "New";
    $scope.player.character.push($scope.character);
    $scope.new_character = true;
    // $scope.player.character. = [$scope.character];
  };

  $scope.deleteCharacter = function () {
    var data = Object();
    // TODO: use user id from user creation management to permission
    // data.user_id = $scope.player.id;
    data.player = $scope.player;
    data.delete_character_id = $scope.character.id;
    // TODO: need to get id if new character or player to update ddb_user
    $http({
      method: "post",
      url: "/cmd/character_view",
      headers: {"Content-Type": "application/json; charset=UTF-8"},
      data: data,
      timeout: 5000
    });
    $scope.player.character.remove($scope.player.character.indexOf($scope.character));
    $scope.character = null;
    // reselect new character if exist
    $scope.setCharacterData(null);
  };

  $scope.deletePlayer = function () {
    var data = Object();
    // TODO: use user id from user creation management to permission
    // data.user_id = $scope.player.id;
    data.delete_player_id = $scope.player.id;
    // TODO: need to get id if new character or player to update ddb_user
    $http({
      method: "post",
      url: "/cmd/character_view",
      headers: {"Content-Type": "application/json; charset=UTF-8"},
      data: data,
      timeout: 5000
    });
    $scope.ddb_user.remove($scope.ddb_user.indexOf($scope.player));
    $scope.player = null;
    $scope.character = null;
  };

  $scope.discardPlayer = function () {
    $scope.new_player = false;
    $scope.player = $scope.last_player;
    // $scope.setCharacterData(null);
  };

  $scope.discardCharacter = function () {
    $scope.new_character = false;
    $scope.character = $scope.last_character;
    // $scope.setCharacterData($scope.character);
  };

  $scope.setCharacterData = function (value) {
    if (!$scope.player) {
      // no player is selected
      $scope.last_character = $scope.character = null;
    } else if (value === null) {
      // if null, select first character
      if (isDefined($scope.player.character) && $scope.player.character.length) {
        $scope.character = $scope.player.character[0];
      } else {
        // no character on this player
        $scope.last_character = $scope.character = null;
      }
    } else {
      $scope.character = value;
    }
  };

  $scope.printCharacterSheet = function () {
    var elem = document.getElementById("characterSheet");
    var domClone = elem.cloneNode(true);

    var printSection = document.getElementById("printSection");

    if (!printSection) {
      printSection = document.createElement("div");
      printSection.id = "printSection";
      document.body.appendChild(printSection);
    }

    printSection.innerHTML = "<h1>Feuille de personnage</h1>";
    printSection.appendChild(domClone);

    window.print();
  };

  $scope.countTotalXp = function () {
    if ($scope.character === null || $scope.model_char === null) {
      return 0;
    }
    // todo doit enlever 5 dans tous les champs de la bd
    var total_xp = $scope.model_char.xp_naissance + $scope.model_char.xp_autre - 5 + $scope.xp_default;
    if (isDefined($scope.model_char.xp_gn_1_2016)) {
      total_xp += $scope.model_char.xp_gn_1_2016;
    }
    if (isDefined($scope.model_char.xp_gn_2_2016)) {
      total_xp += $scope.model_char.xp_gn_2_2016;
    }
    if (isDefined($scope.model_char.xp_gn_3_2016)) {
      total_xp += $scope.model_char.xp_gn_3_2016;
    }
//    if (isDefined($scope.model_char.xp_gn_4_2016)) {
//      total_xp += $scope.model_char.xp_gn_4_2016;
//    }
    return total_xp;
  };

  $scope.countTotalCostXp = function () {
    if ($scope.character === null || $scope.model_char === null) {
      return 0;
    }
    var total_xp = 0;
    if (isDefined($scope.model_char.energie)) {
      total_xp += $scope.model_char.energie.length;
    }
    if (isDefined($scope.model_char.endurance)) {
      total_xp += $scope.model_char.endurance.length;
    }
    if (isDefined($scope.model_char.habilites)) {
      for (var i = 0; i < $scope.model_char.habilites.length; i++) {
        var obj = $scope.model_char.habilites[i];
        if (isDefined(obj.options)) {
          total_xp += obj.options.length;
        }
      }
    }
    if (isDefined($scope.model_char.technique_maitre)) {
      for (var i = 0; i < $scope.model_char.technique_maitre.length; i++) {
        if ($scope.model_char.technique_maitre[i]) {
          total_xp += 1;
        }
      }
    }
    return total_xp;
  };

  $scope.diffTotalXp = function () {
    return $scope.countTotalXp() - $scope.countTotalCostXp()
  };

  $scope.showDiffTotalXp = function () {
    var diff = $scope.diffTotalXp();
    if (diff > 0) {
      return "+" + diff;
    }
    return diff;
  };

  $scope.get_html_qr_code = function () {
    var typeNumber = 5;
    var errorCorrectionLevel = 'L';
    var qr = qrcode(typeNumber, errorCorrectionLevel);
    var data = $window.location.origin + "/character#/?id_player=" + $scope.player.id
    $scope.url_qr_code = data;
    qr.addData(data);
    qr.make();
    $scope.html_qr_code = qr.createImgTag();
  };

  // socket.onmessage = function (e) {
  //   $scope.message = JSON.parse(e.data);
  //   console.log($scope.message);
  //   $scope.$apply();
  // };

// For admin page
//  $http.get("/cmd/character_view").success(
//    function (response/*, status, headers, config*/) {
//      $scope.ddb_user = response.data;
//    }
//  );

  $scope.player_id_from_get = $window.location.hash.substring("#/?id_player=".length);
  if ($scope.is_admin) {
    $scope.url_view_character = "/cmd/character_view?is_admin";
  } else {
    $scope.url_view_character = "/cmd/character_view?player_id=" + $scope.player_id_from_get;
  }
  $http({
    method: "get",
    url: $scope.url_view_character,
    headers: {"Content-Type": "application/json; charset=UTF-8"},
    // data: $httpParamSerializerJQLike(data),
    timeout: 5000
  }).then(function (response/*, status, headers, config*/) {
    $scope.ddb_user = response.data;
    // console.log(response.data);
    // special effect, if only one character, select first one
//      if (data.length == 1) {
//        $scope.player = data[0];
//        $scope.character = data[0].character[0];
//        $scope.setCharacterData(data[0]);
//        $scope.player = data[0];
//        $scope.setCharacterData($scope.character);

//        $scope.$apply();
//      }
  });

  // $http({
  //   method: "get",
  //   url: "/cmd/rule",
  //   headers: {"Content-Type": "application/json; charset=UTF-8"},
  //   // data: $httpParamSerializerJQLike(data),
  //   timeout: 5000
  // }).then(function (response/*, status, headers, config*/) {
  //   $scope.manual = response.data.manual;
  // });
}]);
