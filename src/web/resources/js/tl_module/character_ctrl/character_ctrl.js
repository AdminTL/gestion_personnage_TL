// Formulaire de Traitre-Lame
"use strict";

characterApp.controller("character_ctrl", ["$scope", "$q", "$http", "$window", /*"$timeout",*/ function ($scope, $q, $http, $window) {
  $scope.enable_debug = false;
  $scope.is_admin = $window.location.pathname.indexOf("/admin") >= 0;

  $scope.isMobile = function () {
    return $scope.$parent.active_style == 'Petite personne';
  };

  $scope.is_char_init = false;
  $scope.is_updated_player = false;
  $scope.show_advance_admin_profil_permission = false;

  $scope.disable_character_outside_server = true;
  $scope.disable_character_message = true;

  $scope.model_profile = {
    add_password: {
      password: "",
      check_password: "",
      loading: false
    },
    status_password: {
      text: "",
      enabled: true,
      is_error: false
    }
  };

  $scope.lst_permission = [
    "Joueur", "Admin"
  ]

  $scope.html_qr_code = "";
  $scope.url_qr_code = "";

  $scope.status_validation = 0;
  $scope.lst_msg_status_validation = [];

  $scope.player = null;
  $scope.last_player = null;
  $scope.character = null;
  $scope.last_character = null;
  $scope.ddb_user = [];
  $scope.characterEdit = true;
  $scope.new_player = false;
  $scope.new_character = false;
  $scope.no_character = true;
  $scope.character_skill = new DefaultDict(Array);
  $scope.character_skill_temp = new DefaultDict(Array);

  $scope.char_point = {};
  $scope.char_point_ress = {};
  $scope.char_point_attr = {};
  $scope.char_has_ress = false;

  $scope.model_database = {};
  $scope.model_user = {};
  $scope.schema_user = {};
  $scope.form_user = [];
  $scope.system_point = [];

  $scope.model_char = {};
  $scope.schema_char = {};
  $scope.form_char = [];

  $scope.status_send = {
    enabled: false,
    is_error: false,
    text: ""
  };

  $scope.approbation_status = {
    enabled: false,
    is_error: false,
    text: ""
  };

  $scope.refresh_page = function () {
    location.reload();
  };

  $scope.get_server_status = function () {
    let url = "/cmd/character_status";
    $http({
      method: "get",
      url: url,
      timeout: 5000
    }).then(function (response/*, status, headers, config*/) {
      console.info(response);
      $scope.disable_character_outside_server = !response.data.status_character;
    }, function errorCallback(response) {
      console.error(response);
    });
  };
  $scope.get_server_status();

  // fill user and character schema and form
  $scope.update_character = function () {
    let char_rule_url = $scope.is_admin ? "/cmd/manual_admin" : "/cmd/manual";
    $http({
      method: "get",
      url: char_rule_url,
      headers: {"Content-Type": "application/json; charset=UTF-8"},
      timeout: 5000
    }).then(function (response/*, status, headers, config*/) {
      console.info(response);
      let data = response.data.char_rule;
      $scope.schema_user = data.schema_user;
      $scope.schema_char = data.schema_char;
      $scope.schema_user_point = data.schema_user_point;
      $scope.schema_char_point = data.schema_char_point;
      $scope.schema_user_print = data.schema_user_print;
      $scope.schema_char_print = data.schema_char_print;
      $scope.form_user = data.form_user;
      $scope.form_char = data.form_char;
      $scope.system_point = response.data.system_point;
      $scope.model_database = response.data;
    }, function errorCallback(response) {
      console.error(response);
    });

  };
  $scope.update_character();

  $scope.transform_plural = function (value, label) {
    if (value > 1 || value < -1) {
      return label.replaceAll("(s)", "s").replaceAll("(x)", "x");
    }
    return label.replaceAll("(s)", "").replaceAll("(x)", "");
  };

  $scope.is_approbation_new = function (user) {
    return user && (!isDefined(user.character[0].approbation) || user.character[0].approbation.status === 0);
  };

  $scope.is_approbation_approved = function (user) {
    return user && isDefined(user.character[0].approbation) && user.character[0].approbation.status === 1;
  };

  $scope.is_approbation_unapproved = function (user) {
    return user && isDefined(user.character[0].approbation) && user.character[0].approbation.status === 2;
  };

  $scope.is_approbation_inactive = function (user) {
    return user && isDefined(user.character[0].approbation) && user.character[0].approbation.status === 3;
  };

  $scope.is_approbation_to_correct = function (user) {
    return user && isDefined(user.character[0].approbation) && user.character[0].approbation.status === 4;
  };

  $scope.get_timestamp_approbation_date = function (user) {
    if (user) {
      return user.character[0].approbation.date;
    }
    return -1;
  };

  $scope.get_text_select_character = function (user) {
    let txt_append;
    if ($scope.is_approbation_new(user)) {
      txt_append = '✪';
    } else if ($scope.is_approbation_approved(user)) {
      txt_append = '✓';
    } else if ($scope.is_approbation_unapproved(user)) {
      txt_append = '✗';
    } else if ($scope.is_approbation_inactive(user)) {
      txt_append = '✞';
    } else if ($scope.is_approbation_to_correct(user)) {
      txt_append = '✐';
    } else {
      txt_append = '?';
    }
    return user.name + " " + txt_append;
  };

  $scope.send_approbation = function (status) {
    let data = {};
    data.user_id = $scope.model_user.user_id;
    data.character_name = $scope.model_char.name;
    data.approbation_status = status;

    $http({
      method: "post",
      url: "/cmd/character_approbation",
      headers: {"Content-Type": "application/json; charset=UTF-8"},
      data: data,
      timeout: 5000
    }).then(function (response/*, status, headers, config*/) {
      let data = response.data;
      if (isDefined(response.error)) {
        $scope.approbation_status.enabled = true;
        $scope.approbation_status.is_error = true;
        $scope.approbation_status.text = data.error;
      } else {
        $scope.approbation_status.enabled = true;
        $scope.approbation_status.is_error = false;
        $scope.approbation_status.text = "Succès.";

        let data_approbation = {"date": data.data.date, "status": data.data.status};
        $scope.character.approbation = data_approbation;
      }

    }, function errorCallback(response) {
      console.error(response);

      $scope.approbation_status.enabled = true;
      $scope.approbation_status.is_error = true;

      if (response.status === -1) {
        // Timeout
        $scope.approbation_status.text = "Timeout request.";
      } else {
        // Error from server
        $scope.approbation_status.text = "Error from server : " + response.status;
      }
    });
  };

  $scope.onSubmit = function (form) {
    // First we broadcast an event so all fields validate themselves
    $scope.$broadcast('schemaFormValidate');

    // Then we check if the form is valid
    if (form.$valid) {
      let data = {};
      data.player = $scope.model_user;
      data.character = $scope.model_char;

      // Filter empty element
      for (const [key, lst_value] of Object.entries(data.character)) {
        if (Array.isArray(lst_value)) {
          let new_lst_value = lst_value.filter(function (el) {
            if (Array.isArray(el)) {
              if (el.length) {
                return el.some(function (value) {
                  return value !== null;
                });
              }
              return false;
            }
            return ifObjIsObjNotEmpty(el);
          });
          data.character[key] = new_lst_value;
        }
      }

      $http({
        method: "post",
        url: "/cmd/character_view",
        headers: {"Content-Type": "application/json; charset=UTF-8"},
        data: data,
        timeout: 5000
      }).then(function (response/*, status, headers, config*/) {
        $scope.status_send.enabled = true;

        if (isDefined(response.data.error)) {
          $scope.status_send.text = response.data.error;
          $scope.status_send.is_error = true;
        } else {
          $scope.status_send.is_error = false;
          $scope.status_send.text = "Succès.";
          // TODO not suppose to need to reload the page, block by socket update
          $window.location.reload();
        }

      }, function errorCallback(response) {
        console.error(response);

        $scope.status_send.enabled = true;
        $scope.status_send.is_error = true;

        if (response.status === -1) {
          // Timeout
          $scope.status_send.text = "Timeout request.";
        } else {
          // Error from server
          $scope.status_send.text = "Error from server : " + response.status;
        }
      });

    }
  };

  $scope.$watch("model_user", function (value) {
    console.debug("Update model_user");
    if (value && !isObjEmpty(value)) {
      $scope.prettyModelUser = JSON.stringify(value, undefined, 2);
    } else {
      $scope.prettyModelUser = "";
    }
    if ($scope.is_updated_player) {
      $scope.update_point();
    }
  }, true);

  $scope.$watch("model_char", function (value) {
    console.debug("Update model_char");
    if (value && !isObjEmpty(value)) {
      $scope.prettyModelChar = JSON.stringify(value, undefined, 2);
    } else {
      $scope.prettyModelChar = "";
    }
    if ($scope.is_updated_player) {
      $scope.update_point();
    }
  }, true);

  $scope.update_point = function () {
    if (isObjEmpty($scope.model_char) && !$scope.is_updated_player) {
      return
    }
    $scope.char_point = {};
    $scope.char_point_ress = {};
    $scope.char_point_attr = {};
    $scope.char_has_ress = false;

    $scope.character_skill = new DefaultDict(Array);
    $scope.character_skill_temp = new DefaultDict(Array)
    $scope.count_master_tech = 0;

    if (isUndefined($scope.model_database.skill_manual)) {
      return;
    }

    console.debug("Begin of system point execution.");

    // Level 1 - Initialize
    for (const element of $scope.system_point) {
      // Shadow copy object
      let new_element = {...element};

      if (isUndefined(new_element.initial)) {
        new_element.initial = 0;
      }

      new_element["value"] = 0;
      if (element.type === "Attribut") {
        $scope.char_point_attr[element.name] = new_element;
        $scope.char_point[element.name] = new_element;
        // Field value is modified by the system and skill. The value is negative to be filled.
        // Field max_value is the limitation permitted
        // Field diff_value is max_value + value. If 0, good, if pos, missing fill, if neg, error too much fill
        // Field display_value is the value in reverse : -(value)
        // Field initial for initial value
        new_element["max_value"] = new_element["initial"];
      } else if (element.type == "Ressource") {
        $scope.char_point_ress[element.name] = new_element;
        $scope.char_point[element.name] = new_element;
        // Field value is the ressource value
        // Field initial for initial value
      } else {
        console.error("Type unknown: " + element.type);
        console.error(element);
        continue;
      }

      // Level 2 - Extract data
      // Extract data from char sheet
      if ($scope.schema_char_point.hasOwnProperty(element.name)) {
        for (const [key, value] of Object.entries($scope.schema_char_point[element.name])) {
          // Check status in model_char
          if ($scope.model_char.hasOwnProperty(key) && $scope.model_char[key]) {
            const result = $scope.model_char[key];
            $scope._update_attribut(result, key, value, new_element);
          }
        }
      }

      // Extract data from user sheet
      if ($scope.schema_user_point.hasOwnProperty(element.name)) {
        for (const [key, value] of Object.entries($scope.schema_user_point[element.name])) {
          // Check status in model_user
          if ($scope.model_user.hasOwnProperty(key) && $scope.model_user[key]) {
            const result = $scope.model_user[key];
            $scope._update_attribut(result, key, value, new_element);
          }
        }
      }
    }

    // Extract data
    for (const [key, lst_value] of Object.entries($scope.model_char)) {
      if (Array.isArray(lst_value)) {
        // Manage only first level, sub level is manage by hability
        for (const value of lst_value) {
          if (isUndefined(value) || value == null) {
            console.error("Value is undefined for key " + key + ".");
            console.error(lst_value);
            // Cannot delete, because this error occur when the field is not complete.
            // delete $scope.model_char[key];
          } else if (typeof value == "string") {
            if ($scope.model_database.point.hasOwnProperty(value)) {
              for (const [point_name, point_value] of Object.entries($scope.model_database.point[value])) {
                // TODO get new_element
                let new_element = $scope.char_point[point_name];
                $scope._update_attribut(true, value, point_value, new_element, key);
              }
            }
          } else if (Array.isArray(value)) {
            console.error("Cannot support array.");
          } else if (typeof value == "object") {
            // Ignore when missing options, the skill is not completed
            if (value.hasOwnProperty("options")) {
              for (const option of value.options) {
                let new_value = key + "_" + option;
                if ($scope.model_database.point.hasOwnProperty(new_value)) {
                  for (const [point_name, point_value] of Object.entries($scope.model_database.point[new_value])) {
                    // TODO get new_element
                    let new_element = $scope.char_point[point_name];
                    $scope._update_attribut(true, new_value, point_value, new_element, key);
                  }
                } else {
                  console.error("Missing  " + key + " " + new_value);
                }
              }
            } else {
              // Only 1 level to support
              let new_key;
              let pos_char = key.indexOf("_");
              if (pos_char >= 0) {
                new_key = key.slice(0, pos_char);
              } else {
                new_key = key;
              }
              let new_value = new_key + "_" + value["sub_" + new_key];
              if ($scope.model_database.point.hasOwnProperty(new_value)) {
                for (const [point_name, point_value] of Object.entries($scope.model_database.point[new_value])) {
                  // TODO get new_element
                  let new_element = $scope.char_point[point_name];
                  $scope._update_attribut(true, new_value, point_value, new_element, key);
                }
              } else {
                console.error("Missing  " + key + " " + new_value);
              }
            }
          } else {
            console.error("Another type for key " + key + " and type value " + typeof value);
          }
        }
      }
    }

    // Level 3 - Update attribut
    for (const [key, new_element] of Object.entries($scope.char_point)) {
      if (new_element.type === "Attribut") {
        if (isDefined(new_element.max)) {
          new_element.value = -Math.min(-new_element.value, new_element.max);
          new_element.max_value = Math.min(new_element.max_value, new_element.max);
        }
        if (isDefined(new_element.min)) {
          new_element.value = -Math.max(-new_element.value, new_element.min);
          new_element.max_value = Math.max(new_element.max_value, new_element.min);
        }
        new_element["diff_value"] = new_element["max_value"] + new_element["value"];
        new_element["display_value"] = -new_element["value"];

        // Special case
        if (new_element["hide_value"]) {
          new_element["value"] = new_element["max_value"];
        }
      }
    }

    // Level 4 - end of execution
    // Run formule when all is created
    for (const sys_ele of $scope.system_point) {
      if (sys_ele.formule && isDefined(sys_ele.formule)) {
        let result = $scope._run_formule(sys_ele.formule, $scope.char_point);
        let new_element = $scope.char_point[sys_ele.name];
        if (!isDefined(new_element)) {
          console.error("Formule execution error, check " + sys_ele.name);
        } else {
          if (isDefined(new_element.max)) {
            result = Math.min(result, new_element.max);
          }
          if (isDefined(new_element.min)) {
            result = Math.max(result, new_element.min);
          }
          new_element["formule_result"] = result;
        }
      }
    }

    // Level 5 - Update status
    // Fill documentation
    for (const [key, lst_value] of Object.entries($scope.model_char)) {
      if (Array.isArray(lst_value)) {
        // Manage only first level, sub level is manage by hability
        for (const value of lst_value) {
          if (!isDefined(value) || value == null) {
            console.error("Value is undefined for key " + key + ".");
            console.error(lst_value);
          } else if (typeof value == "string") {
            $scope._update_documentation(key, [value]);
          } else if (Array.isArray(value)) {
            console.error("Cannot support array.");
          } else if (typeof value == "object") {
            // Ignore when missing options, the skill is not completed
            // TODO options is hardcoded, find a way to find this information
            if (value.hasOwnProperty("options")) {
              // 3 levels
              for (const option of value.options) {
                let new_value = key + "_" + option;
                $scope._update_documentation(key, [new_value]);
              }
            } else {
              // TODO this is hardcoded hack
              if ($scope.isConsumed(key)) {
                // Ignore consumed skill
                continue;
              }
              let new_key = key;
              let game_index = key.indexOf("_jeu_");
              if (game_index > -1) {
                new_key = key.slice(0, game_index);
              }
              // 2 levels
              let item_name = value["sub_" + new_key];
              let new_value = new_key + "_" + item_name;
              let lst_new_value = [new_value]
              if (value.hasOwnProperty("sub_region")) {
                let build_value = new_key + "_" + value["sub_region"];
                lst_new_value.push(build_value);
              }

              $scope._update_documentation(new_key, lst_new_value);
            }
          } else {
            console.error("Another type for key " + key + " and type value " + typeof value);
          }
        }
      }
    }

    $scope._finalise_documentation();

    for (const [key, value] of Object.entries($scope.char_point_ress)) {
      if ((isDefined(value.formule_result) && value.formule_result > 0) || (!isDefined(value.formule_result) && value.value > 0)) {
        $scope.char_has_ress = true;
        break;
      }
    }

    $scope.get_status_validation();
    console.debug("End of system point execution.");
  };

  $scope._update_documentation = function (key, lst_new_value) {
    // Search duplicated
    let is_find = false;
    let build_item = "";
    for (const new_value of lst_new_value) {
      if (new_value in $scope.model_database.skill_manual) {
        let doc_item = $scope.model_database.skill_manual[new_value];
        let origin_item = doc_item.repeat(1);
        if (build_item.length > 0) {
          build_item += " " + origin_item;
        } else {
          build_item += origin_item;
        }
      } else {
        console.error("Missing documentation " + new_value);
      }
    }
    for (let ele of $scope.character_skill_temp[key]) {
      if (ele.item.localeCompare(build_item) == 0) {
        ele.count += 1;
        is_find = true;
        break;
      }
    }
    if (!is_find) {
      let new_item = {
        "item": build_item,
        "count": 1
      }
      $scope.character_skill_temp[key].push(new_item)
    }
  };

  $scope._finalise_documentation = function () {
    for (const [key, lst_value] of Object.entries($scope.character_skill_temp)) {
      for (let value of lst_value) {
        let new_title;
        if (value.count > 1) {
          new_title = value.count + "x " + value.item;
        } else if (value.count == 1) {
          new_title = value.item;
        }
        $scope.character_skill[key].push(new_title);
      }
    }
  };

  $scope._run_formule = function (unique_variable_formule, unique_variable_dct_element) {
    try {
      if (unique_variable_formule) {
        for (const [unique_variable_key_ele, unique_variable_var_ele] of Object.entries(unique_variable_dct_element)) {
          eval("window['" + unique_variable_var_ele.name + "'] = " + JSON.stringify(unique_variable_var_ele) + ";");
        }

        // let unique_variable_formule_mod = unique_variable_formule.replaceAll(".max", ".max_value");
        let result = eval(unique_variable_formule);
        console.debug("Calcul formule, result for '" + unique_variable_formule + "'");
        console.debug(result)
        return result
      }
    } catch (err) {
      console.error(err);
      return 0;
    }
  };

  $scope._update_attribut = function (result, key, value, element, root_skill = null) {
    // result is the value to affect the element, like a boolean
    // value is the transformation
    // element is the cache to update
    let ele_key_name;
    if (typeof value === "object") {
      const lst_key = Object.keys(value);
      if (lst_key.length > 1) {
        console.error("Too much key for " + key + " _ " + value + " _ " + element);
      }
      const extract_key = lst_key[0];
      value = value[extract_key];
      ele_key_name = extract_key + "_value";
    } else {
      ele_key_name = "value";
    }
    if (isBoolean(result)) {
      if (root_skill !== null && $scope.isConsumed(root_skill)) {
        if (element.type == "Attribut" && isDefined(element.max_value)) {
          element.max_value += value;
        }
        return;
      }
      if (ele_key_name in element) {
        element[ele_key_name] += value;
      } else {
        element[ele_key_name] = value;
      }
    } else if (isNumber(result)) {
      if (root_skill !== null && $scope.isConsumed(root_skill)) {
        if (element.type == "Attribut" && isDefined(element.max_value)) {
          element.max_value += value;
        }
        return;
      }
      if (ele_key_name in element) {
        element[ele_key_name] += value * result;
      } else {
        element[ele_key_name] = value * result;
      }
    } else {
      console.error("Type " + typeof result + " is not supported.")
    }
  };

  $scope.$watch("character_skill", function (value) {
    $scope.prettySkill = JSON.stringify(value, undefined, 2);
  });

  $scope.$watch("player", function (value) {
    if (!value) {
      $scope.clear_sheet({});
      return;
    }
    $scope.prettyPlayer = JSON.stringify(value, undefined, 2);
    // update model information
    $scope.model_user = filterIgnore(value, ["$$hashKey", "character"]);
    // TODO need to find right id character, and not taking first!
    if (isDefined(value.character)) {
      let firstChar = value.character[0];
      $scope.model_char = filterIgnore(firstChar, ["$$hashKey"]);
      $scope.clear_sheet($scope.model_char)
    } else {
      $scope.clear_sheet({}, true);
    }
    $scope.update_point();
    $scope.is_updated_player = true;
    $scope.get_html_qr_code();
  }, true);

  $scope.clear_sheet = function (model_char, force_clean = false) {
    $scope.model_char = model_char;
    if (isUndefined($scope.model_char)) {
      $scope.model_char = {};
    }

    if (isDefined($scope.schema_char.properties)) {
      for (const [key, value] of Object.entries($scope.schema_char.properties)) {
        if (value.hasOwnProperty("type")) {
          if (value.type === "array") {
            if (!isDefined($scope.model_char[key]) || force_clean) {
              $scope.model_char[key] = [];
            }
            // } else if (value.type == "integer") {
            //   $scope.model_char[key] = 0;
          }
        }
      }
    }
  }

  $scope.newPlayer = function () {
    // create empty player with empty character
    $scope.clear_sheet($scope.model_char, true);
    $scope.last_player = $scope.player = {};
    $scope.last_character = $scope.character = {};
    $scope.player.character = [$scope.character];

    $scope.setCharacterData(null);
    $scope.new_player = true;
    $scope.no_character = false;
  };

  // $scope.newCharacter = function () {
  //   // create empty player with empty character
  //   $scope.last_character = $scope.character = {};
  //   $scope.character.name = "New";
  //   $scope.player.character.push($scope.character);
  //   $scope.new_character = true;
  //   // $scope.player.character. = [$scope.character];
  // };

  $scope.deleteCharacter = function () {
    let data = Object();
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
    if (!confirm('Êtes-vous certain de vouloir effacer cette fiche?')) {
      return;
    }

    // TODO: use user id from user creation management to permission
    // data.user_id = $scope.player.id;
    let data = {
      "delete_user_by_id": $scope.player.user_id,
    };
    console.debug(data);
    // TODO: need to get id if new character or player to update ddb_user
    $http({
      method: "post",
      url: "/cmd/character_view",
      headers: {"Content-Type": "application/json; charset=UTF-8"},
      data: data,
      timeout: 5000
    }).then(function (response/*, status, headers, config*/) {
      if (isDefined(response.data.error)) {
        console.error(response.data.error);
        $scope.status_send.text = response.data.error;
        $scope.status_send.is_error = true;
      } else {
        $scope.status_send.is_error = false;
        $scope.status_send.text = "Succès.";

        $scope.ddb_user.remove($scope.ddb_user.indexOf($scope.player));
        $scope.player = null;
        $scope.character = null;
      }
    }, function errorCallback(response) {
      console.error(response);
    })
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

  $scope.get_status_validation = function () {
    $scope.status_validation = 0;
    $scope.lst_msg_status_validation = []

    // Search validateRequired
    if (isDefined($scope.schema_char.properties)) {
      for (const [key, value] of Object.entries($scope.schema_char.properties)) {
        if (value.hasOwnProperty("validateRequired") && value.validateRequired) {
          if (value.type === "string") {
            if (!$scope.model_char[key]) {
              $scope.status_validation = -1;
              if (isDefined(value.title)) {
                $scope.lst_msg_status_validation.push("Le champs «" + value.title + "» doit être rempli.")
              } else {
                $scope.lst_msg_status_validation.push("Le champs «" + key + "» doit être rempli.")
              }
            }
          } else {
            console.error(value);
            console.error("Key " + key + " type not supported: " + value.type);
          }
        }
      }
    }

    if ($scope.status_validation !== 0) {
      return;
    }

    for (const [key_ele, var_ele] of Object.entries($scope.char_point_attr)) {
      if (var_ele.required) {
        if (var_ele.type === "Attribut") {
          if (var_ele.diff_value < 0) {
            $scope.status_validation = -1;
            return
          } else if (var_ele.diff_value > 0) {
            $scope.status_validation = 1;
            return
          }
        }
      }
    }

    $scope.status_validation = 0;
  };

  $scope.modify_password = function (e) {
    // Validate request is not pending
    if ($scope.model_profile.add_password.loading) {
      return;
    }

    // Validate model field
    if ($scope.model_profile.add_password.password === "") {
      $scope.model_profile.status_password.enabled = true;
      $scope.model_profile.status_password.is_error = true;
      $scope.model_profile.status_password.text = "The password is empty.";
    } else if ($scope.model_profile.add_password.password !== $scope.model_profile.add_password.check_password) {
      $scope.model_profile.status_password.enabled = true;
      $scope.model_profile.status_password.is_error = true;
      $scope.model_profile.status_password.text = "The password is not identical to the check password.";
    } else {
      let data = {
        "password": hashSha256($scope.model_profile.add_password.password),
        "user_id": $scope.model_user.user_id,
      };

      // Send command to server
      $scope.model_profile.add_password.loading = true;
      $http({
        method: "post",
        url: "/admin/profile/modify_password",
        headers: {"Content-Type": "application/json; charset=UTF-8"},
        data: data,
        timeout: 2000
      }).then(function (response/*, status, headers, config*/) {
        console.info(response.data);

        // Reset the loading
        $scope.model_profile.add_password.loading = false;
        $scope.model_profile.add_password.password = "";
        $scope.model_profile.add_password.check_password = "";

        // Show message from server
        $scope.model_profile.status_password.enabled = true;
        if ("error" in response.data) {
          $scope.model_profile.status_password.is_error = true;
          $scope.model_profile.status_password.text = response.data.error;
        } else if ("status" in response.data) {
          $scope.model_profile.status_password.is_error = false;
          $scope.model_profile.status_password.text = response.data.status;
        } else {
          $scope.model_profile.status_password.is_error = true;
          $scope.model_profile.status_password.text = "Unknown error";
        }
      }, function errorCallback(response) {
        console.error(response);

        if (response.status === -1) {
          // Timeout
          $scope.model_profile.add_password.loading = false;
          $scope.model_profile.status_password.is_error = true;
          $scope.model_profile.status_password.text = "Timeout request.";
        } else {
          // Error from server
          $scope.model_profile.add_password.loading = false;
          $scope.model_profile.status_password.is_error = true;
          $scope.model_profile.status_password.text = "Error from server : " + response.status;
        }
      });
    }
  };

  $scope.colorNumberHTML = function (text) {
    if (!text || !isDefined(text)) {
      return "";
    }
    if (isNumber(text)) {
      return '<span class="neutral_color_bold">' + text + '</span>';
    }
    try {
      return text.replace(/\d([xX]+)/, '<span class="multiplier_color_bold">$&</span>').replace(/([+-]+)\d/, '<span class="sign_color_bold">$&</span>').replace(/\d+/g, '<span class="neutral_color_bold">$&</span>');
    } catch (e) {
      console.error("Cannot use String.replace function.");
      return text;
    }
  };

  $scope.isConsumed = function (skill_name_tree) {
    // Detect if the skills is consumed, we need to hide it and remove his ressources
    if (isDefined($scope.schema_char.properties)) {
      let obj = $scope.schema_char.properties[skill_name_tree];
      if (isDefined($scope.schema_char.properties[skill_name_tree])) {
        return obj.estConsomme === true;
      } else {
        console.warn("Missing the skill name tree '" + skill_name_tree + "'");
      }
    }
  };

  $scope.isNumber = function (number) {
    return typeof number === 'number';
  };

  $scope.isDefined = function (x) {
    return x !== undefined;
  };

  $scope.toTitleCase = function (str) {
    return str.replaceAll("_", " ").replace(
      /\w\S*/g,
      function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      })
  };

  $scope.get_html_qr_code = function () {
    let typeNumber = 5;
    let errorCorrectionLevel = 'L';
    let qr = qrcode(typeNumber, errorCorrectionLevel);
    let data = $window.location.origin + "/character#/?id_player=" + $scope.player.id;
    $scope.url_qr_code = data;
    qr.addData(data);
    qr.make();
    $scope.html_qr_code = qr.createImgTag();
  };

  $scope.is_main = $window.location.hash.substring($window.location.hash.length - 4) === "#!/";
  if ($scope.is_main) {
    $scope.player_id_from_get = "";
  } else {
    // Get id_player, it's suppose to be the last 32 bytes
    $scope.player_id_from_get = $window.location.hash.substr(-32);
    // When no id_player, it's because == #!/
    if ($scope.player_id_from_get === "#!/") {
      $scope.player_id_from_get = "";
    } else {
      $scope.no_character = true;
    }
  }

  if ($scope.is_admin) {
    $scope.url_view_character = "/cmd/character_view?is_admin";
  } else {
    $scope.url_view_character = "/cmd/character_view";
  }
  $http({
    method: "get",
    url: $scope.url_view_character,
    headers: {"Content-Type": "application/json; charset=UTF-8"},
    // data: $httpParamSerializerJQLike(data),
    timeout: 5000
  }).then(function (response/*, status, headers, config*/) {
    $scope.ddb_user = response.data;
    console.log(response.data);
    let data = response.data;
    // special effect, if only one character, select first one
    if ((data.length >= 1 && !$scope.is_admin) || (data.length === 1 && $scope.is_admin)) {
      $scope.player = data[0];
      $scope.character = data[0].character[0];
      $scope.is_char_init = true;
    }
  });
}]);
