// Formulaire de Traitre-Lame
characterApp.controller("character_ctrl", ["$scope", "$q", "$http", "$timeout", function ($scope, $q, $http, $timeout) {
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

  var DATABASE_FORM = [
    {
      key: "name",
      placeholder: "Votre nom entier (prénom et nom)"
    },
    {
      key: "email",
      placeholder: "Votre courriel"
    },
    {
      key: "comment",
      type: "textarea",
      placeholder: "Je ne sais pas quoi écrire.",
    },
    {
      key: "faction",
      type: "select",
      placeholder: "Choisissez votre faction, ou laissez vide si pas de faction.",
      titleMap: [
        {value: "empty", name: "- Aucune faction -"},
        {value: "vanican", name: "Vanican"},
        {value: "canavim", name: "Canavim"},
        {value: "vallam", name: "Vallam"},
        {value: "sarsare", name: "Sarsare"}
      ]
    },
    {
      "key": "comments",
      "add": "New",
      "style": {
        "add": "btn-success"
      },
      "items": [
        "comments[].name",
        "comments[].email",
        {
          "key": "comments[].spam",
          "type": "checkbox",
          "title": "Yes I want spam.",
          "condition": "model.comments[arrayIndex].email"
        },
        {
          "key": "comments[].comment",
          "type": "textarea"
        }
      ]
    },
    {
      type: "submit",
      style: "btn-info",
      title: "OK"
    }
  ];

  // see import in character.html
  $scope.schema = DATABASE_SCHEMA;
  $scope.form = DATABASE_FORM;
  $scope.model = {};

  $scope.$watch("player", function (value) {
    if (value) {
      $scope.prettyModel = JSON.stringify(value, undefined, 2);
    }
    // $scope.player = value;
  }, true);


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
    var elem = document.getElementById("characterSheet");
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

  $http.get("/cmd/character_view").success(
    function (data, status, headers, config) {
      $scope.ddb_user = data;
    }
  );

  $http.get("/cmd/rule").success(
    function (data, status, headers, config) {
      $scope.rule = data;
    }
  );

}]);
