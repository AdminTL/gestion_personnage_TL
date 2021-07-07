// Formulaire de Traitre-Lame
"use strict";

characterApp.controller("character_ctrl", ["$scope", "$q", "$http", "$window", /*"$timeout",*/ function ($scope, $q, $http, $window) {
  // var data_source = "http://" + window.location.host + "/update_user";
  // var socket = new SockJS(data_source);
  $scope.is_admin = $window.location.pathname.indexOf("/admin") >= 0;

  $scope.isMobile = function () {
    return $scope.$parent.active_style == 'Petite personne';
  };

  // todo move this variable in json
  $scope.xp_default = 6;

  $scope.is_char_init = false;
  $scope.is_updated_player = false;

  $scope.enable_debug = false;
  $scope.sheet_view = {};
  $scope.sheet_view.mode = "form_write";

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
  $scope.character_point = {};
  $scope.character_reduce_point = {};
  $scope.character_skill = [];
  $scope.character_merite = [];
  $scope.character_esclave = [];
  $scope.character_marche = [];
  $scope.lst_habilites = [];

  $scope.char_point = {};
  $scope.char_point_ress = {};
  $scope.char_point_attr = {};
  $scope.char_has_ress = false;

  $scope.xp_receive = 0;
  $scope.xp_spend = 0;
  $scope.xp_total = 0;

  $scope.capacity_sous_ecole = 0;
  $scope.count_sous_ecole = 0;
  $scope.diff_sous_ecole = 0;

  $scope.merite_receive = 0;
  $scope.merite_spend = 0;
  $scope.merite_total = 0;

  $scope.count_master_tech = 0;
  $scope.validated_count_master_tech = false;

  $scope.model_database = {};
  $scope.model_user = {};
  $scope.schema_user = {};
  $scope.form_user = [];
  $scope.system_point = [];
  $scope.habilites_point = {};

  $scope.model_char = {};
  $scope.schema_char = {};
  $scope.form_char = [];

  // using character sheet as cs for brevity
  $scope.cs_player = {};
  $scope.cs_character = {};
  $scope.cs_character_habilites = {};
  $scope.cs_setting = "filled";
  $scope.cs_checks = [];

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

  // fill user and character schema and form
  $scope.update_character = function (e) {
    var char_rule_url = $scope.is_admin ? "/cmd/manual_admin" : "/cmd/manual";
    $http({
      method: "get",
      url: char_rule_url,
      headers: {"Content-Type": "application/json; charset=UTF-8"},
      timeout: 5000
    }).then(function (response/*, status, headers, config*/) {
      console.info(response);
      var data = response.data.char_rule;
      $scope.schema_user = data.schema_user;
      $scope.schema_char = data.schema_char;
      $scope.schema_user_point = data.schema_user_point;
      $scope.schema_char_point = data.schema_char_point;
      $scope.form_user = data.form_user;
      $scope.form_char = data.form_char;
      $scope.system_point = response.data.system_point;
      $scope.habilites_point = response.data.hability_point;
      $scope.model_database = response.data;
      $scope.is_char_init = true;
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
    return user && (isUndefined(user.character[0].approbation) || user.character[0].approbation.status == 0);
  };

  $scope.is_approbation_approved = function (user) {
    return user && isDefined(user.character[0].approbation) && user.character[0].approbation.status == 1;
  };

  $scope.is_approbation_unapproved = function (user) {
    return user && isDefined(user.character[0].approbation) && user.character[0].approbation.status == 2;
  };

  $scope.is_approbation_inactive = function (user) {
    return user && isDefined(user.character[0].approbation) && user.character[0].approbation.status == 3;
  };

  $scope.is_approbation_to_correct = function (user) {
    return user && isDefined(user.character[0].approbation) && user.character[0].approbation.status == 4;
  };

  $scope.get_timestamp_approbation_date = function (user) {
    if (user) {
      return user.character[0].approbation.date;
    }
    return -1;
  };

  $scope.get_text_select_character = function (user) {
    var txt_append = "";
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
    var data = {};
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
      var data = response.data;
      if (isDefined(response.error)) {
        $scope.approbation_status.enabled = true;
        $scope.approbation_status.is_error = true;
        $scope.approbation_status.text = data.error;
      } else {
        $scope.approbation_status.enabled = true;
        $scope.approbation_status.is_error = false;
        $scope.approbation_status.text = "Succès.";

        var data_approbation = {"date": data.data.date, "status": data.data.status};
        $scope.character.approbation = data_approbation;
      }

    }, function errorCallback(response) {
      console.error(response);

      $scope.approbation_status.enabled = true;
      $scope.approbation_status.is_error = true;

      if (response.status == -1) {
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
      var data = {};
      data.player = $scope.model_user;
      data.character = $scope.model_char;

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

        if (response.status == -1) {
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
    if (value) {
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
    if (value) {
      $scope.prettyModelChar = JSON.stringify(value, undefined, 2);
    } else {
      $scope.prettyModelChar = "";
    }
    if ($scope.is_updated_player) {
      $scope.update_point();
    }
  }, true);

  $scope.update_old_system_point = function () {
    // if (isDefined($scope.model_char.energie)) {
    //   for (var i = 0; i < $scope.model_char.energie.length; i++) {
    //     var sub_key = "Energie_1";
    //
    //     if (sub_key in $scope.model_database.skill_manual) {
    //       $scope.character_skill.push($scope.model_database.skill_manual[sub_key]);
    //     }
    //
    //     if (sub_key in $scope.model_database.point) {
    //       var dct_key_point = $scope.model_database.point[sub_key];
    //
    //       for (var key_point in dct_key_point) {
    //         if (dct_key_point.hasOwnProperty(key_point)) {
    //           var point_value = dct_key_point[key_point];
    //           if (key_point in $scope.character_point) {
    //             $scope.character_point[key_point] += point_value;
    //           } else {
    //             $scope.character_point[key_point] = point_value;
    //           }
    //         }
    //       }
    //     }
    //   }
    // }

    // if (isDefined($scope.model_char.endurance)) {
    //   for (var i = 0; i < $scope.model_char.endurance.length; i++) {
    //     var sub_key = "Endurance_1";
    //
    //     if (sub_key in $scope.model_database.skill_manual) {
    //       $scope.character_skill.push($scope.model_database.skill_manual[sub_key]);
    //     }
    //
    //     if (sub_key in $scope.model_database.point) {
    //       var dct_key_point = $scope.model_database.point[sub_key];
    //
    //       for (var key_point in dct_key_point) {
    //         if (dct_key_point.hasOwnProperty(key_point)) {
    //           var point_value = dct_key_point[key_point];
    //           if (key_point in $scope.character_point) {
    //             $scope.character_point[key_point] += point_value;
    //           } else {
    //             $scope.character_point[key_point] = point_value;
    //           }
    //         }
    //       }
    //     }
    //   }
    // }

    $scope.lst_habilites = [];
    if (isDefined($scope.model_char.technique_maitre)) {
      for (var i = 0; i < $scope.model_char.technique_maitre.length; i++) {
        var obj = $scope.model_char.technique_maitre[i];
        if (isDefined(obj.options)) {
          // total_xp += obj.options.length;
          // Find the associate point
          for (var j = 0; j < obj.options.length; j++) {
            var sub_key = "technique_maitre_" + obj.options[j];

            if (sub_key in $scope.model_database.skill_manual) {
              $scope.character_skill.push($scope.model_database.skill_manual[sub_key]);
            }

            if (sub_key in $scope.model_database.point) {
              $scope.lst_habilites.push(sub_key);

              var dct_key_point = $scope.model_database.point[sub_key];
              $scope.count_master_tech += 1;

              // for (var key_point in dct_key_point) {
              //   if (dct_key_point.hasOwnProperty(key_point)) {
              //     var point_value = dct_key_point[key_point];
              //     if (key_point in $scope.character_point) {
              //       $scope.character_point[key_point] += point_value;
              //     } else {
              //       $scope.character_point[key_point] = point_value;
              //     }
              //   }
              // }
            }
          }
        }
      }
    }

    if (isDefined($scope.model_char.habilites)) {
      for (var i = 0; i < $scope.model_char.habilites.length; i++) {
        var obj = $scope.model_char.habilites[i];
        if (isDefined(obj.options)) {
          // total_xp += obj.options.length;
          // Find the associate point
          for (var j = 0; j < obj.options.length; j++) {
            var sub_key = "habilites_" + obj.options[j];

            if (sub_key in $scope.model_database.skill_manual) {
              $scope.character_skill.push($scope.model_database.skill_manual[sub_key]);
            }

            if (sub_key in $scope.model_database.point) {
              $scope.lst_habilites.push(sub_key);
            }
          }
        }
      }

      for (var i = 0; i < $scope.lst_habilites.length; i++) {
        var sub_key = $scope.lst_habilites[i];
        var dct_key_point = $scope.model_database.point[sub_key];

        for (var key_point in dct_key_point) {
          if (dct_key_point.hasOwnProperty(key_point)) {
            var point_value = dct_key_point[key_point];

            // Exception for salary, multiply PtPA
            if (sub_key == "habilites_Salaire" && key_point == "PtPA") {
              var total_value = point_value;
              if ($scope.lst_habilites.indexOf("habilites_Alchimie") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("habilites_Enchantement") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("habilites_Artisanat") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("habilites_Forge") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("habilites_Herboristerie") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("habilites_Mixture de potions") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("habilites_Marchandage_1") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("habilites_Marchandage_2") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("habilites_Marchandage_3") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("habilites_Marchandage_4") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("habilites_Marchandage_5") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("habilites_Sp\u00e9cialiste I - Herboristerie") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("habilites_Sp\u00e9cialiste I - Artisanat") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("habilites_Sp\u00e9cialiste I - Enchantement") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("habilites_Sp\u00e9cialiste I - Forge") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("habilites_Sp\u00e9cialiste I - Alchimie") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("habilites_Sp\u00e9cialiste I - Mixture de Potion") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("habilites_Sp\u00e9cialiste II - Herboristerie") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("habilites_Sp\u00e9cialiste II - Artisanat") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("habilites_Sp\u00e9cialiste II - Enchantement") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("habilites_Sp\u00e9cialiste II - Alchimie") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("habilites_Sp\u00e9cialiste II - Forge") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("habilites_Sp\u00e9cialiste II - Mixture de Potion") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("technique_maitre_Joaillier") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("technique_maitre_Orfèvre") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("technique_maitre_Marchand prolofique") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("technique_maitre_Grand-enchanteur") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("technique_maitre_Contrebande") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("technique_maitre_Caravanier") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("technique_maitre_Multi-Spécialiste") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("technique_maitre_Forge Légendaire: Bluam") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("technique_maitre_Forge Légendaire: Sanglite") > -1) {
                total_value += point_value;
              }
              if ($scope.lst_habilites.indexOf("technique_maitre_Forge Légendaire: Malachite") > -1) {
                total_value += point_value;
              }
              point_value = total_value;
            }

            if (key_point in $scope.character_point) {
              $scope.character_point[key_point] += point_value;
            } else {
              $scope.character_point[key_point] = point_value;
            }
          }
        }
      }
    }

    // if (isDefined($scope.model_char.merite)) {
    //   for (var i = 0; i < $scope.model_char.merite.length; i++) {
    //     if (isUndefined($scope.model_char.merite[i]) || !$scope.model_char.merite[i]) {
    //       continue;
    //     }
    //     // Find the associate point
    //     var sub_key = "merite_" + $scope.model_char.merite[i].sub_merite;
    //
    //     if (sub_key in $scope.model_database.skill_manual) {
    //       $scope.character_merite.push($scope.model_database.skill_manual[sub_key]);
    //     }
    //
    //     if (sub_key in $scope.model_database.point) {
    //       var dct_key_point = $scope.model_database.point[sub_key];
    //
    //       for (var key_point in dct_key_point) {
    //         if (dct_key_point.hasOwnProperty(key_point)) {
    //           var point_value = dct_key_point[key_point];
    //           if (key_point in $scope.character_point) {
    //             $scope.character_point[key_point] += point_value;
    //           } else {
    //             $scope.character_point[key_point] = point_value;
    //           }
    //         }
    //       }
    //     }
    //   }
    // }

    if (isDefined($scope.model_char.merite_jeu_1)) {
      for (var i = 0; i < $scope.model_char.merite_jeu_1.length; i++) {
        if (isUndefined($scope.model_char.merite_jeu_1[i]) || !$scope.model_char.merite_jeu_1[i]) {
          continue;
        }
        // Find the associate point
        var sub_key = "merite_" + $scope.model_char.merite_jeu_1[i].sub_merite;

        if (sub_key in $scope.model_database.point) {
          var dct_key_point = $scope.model_database.point[sub_key];

          for (var key_point in dct_key_point) {
            if (dct_key_point.hasOwnProperty(key_point)) {
              var point_value = dct_key_point[key_point];
              if (key_point in $scope.character_reduce_point) {
                $scope.character_reduce_point[key_point] += point_value;
              } else {
                $scope.character_reduce_point[key_point] = point_value;
              }
            }
          }
        }
      }
    }

    if (isDefined($scope.model_char.merite_jeu_2)) {
      for (var i = 0; i < $scope.model_char.merite_jeu_2.length; i++) {
        if (isUndefined($scope.model_char.merite_jeu_2[i]) || !$scope.model_char.merite_jeu_2[i]) {
          continue;
        }
        // Find the associate point
        var sub_key = "merite_" + $scope.model_char.merite_jeu_2[i].sub_merite;

        if (sub_key in $scope.model_database.point) {
          var dct_key_point = $scope.model_database.point[sub_key];

          for (var key_point in dct_key_point) {
            if (dct_key_point.hasOwnProperty(key_point)) {
              var point_value = dct_key_point[key_point];
              if (key_point in $scope.character_reduce_point) {
                $scope.character_reduce_point[key_point] += point_value;
              } else {
                $scope.character_reduce_point[key_point] = point_value;
              }
            }
          }
        }
      }
    }

    if (isDefined($scope.model_char.merite_jeu_3)) {
      for (var i = 0; i < $scope.model_char.merite_jeu_3.length; i++) {
        if (isUndefined($scope.model_char.merite_jeu_3[i]) || !$scope.model_char.merite_jeu_3[i]) {
          continue;
        }
        // Find the associate point
        var sub_key = "merite_" + $scope.model_char.merite_jeu_3[i].sub_merite;

        if (sub_key in $scope.model_database.point) {
          var dct_key_point = $scope.model_database.point[sub_key];

          for (var key_point in dct_key_point) {
            if (dct_key_point.hasOwnProperty(key_point)) {
              var point_value = dct_key_point[key_point];
              if (key_point in $scope.character_reduce_point) {
                $scope.character_reduce_point[key_point] += point_value;
              } else {
                $scope.character_reduce_point[key_point] = point_value;
              }
            }
          }
        }
      }
    }

    if (isDefined($scope.model_char.merite_jeu_4)) {
      for (var i = 0; i < $scope.model_char.merite_jeu_4.length; i++) {
        if (isUndefined($scope.model_char.merite_jeu_4[i]) || !$scope.model_char.merite_jeu_4[i]) {
          continue;
        }
        // Find the associate point
        var sub_key = "merite_" + $scope.model_char.merite_jeu_4[i].sub_merite;

        if (sub_key in $scope.model_database.point) {
          var dct_key_point = $scope.model_database.point[sub_key];

          for (var key_point in dct_key_point) {
            if (dct_key_point.hasOwnProperty(key_point)) {
              var point_value = dct_key_point[key_point];
              if (key_point in $scope.character_reduce_point) {
                $scope.character_reduce_point[key_point] += point_value;
              } else {
                $scope.character_reduce_point[key_point] = point_value;
              }
            }
          }
        }
      }
    }

    if (isDefined($scope.model_char.merite_jeu_5)) {
      for (var i = 0; i < $scope.model_char.merite_jeu_5.length; i++) {
        if (isUndefined($scope.model_char.merite_jeu_5[i]) || !$scope.model_char.merite_jeu_5[i]) {
          continue;
        }
        // Find the associate point
        var sub_key = "merite_" + $scope.model_char.merite_jeu_5[i].sub_merite;

        if (sub_key in $scope.model_database.point) {
          var dct_key_point = $scope.model_database.point[sub_key];

          for (var key_point in dct_key_point) {
            if (dct_key_point.hasOwnProperty(key_point)) {
              var point_value = dct_key_point[key_point];
              if (key_point in $scope.character_reduce_point) {
                $scope.character_reduce_point[key_point] += point_value;
              } else {
                $scope.character_reduce_point[key_point] = point_value;
              }
            }
          }
        }
      }
    }

    if (isDefined($scope.model_char.merite_jeu_6)) {
      for (var i = 0; i < $scope.model_char.merite_jeu_6.length; i++) {
        if (isUndefined($scope.model_char.merite_jeu_6[i]) || !$scope.model_char.merite_jeu_6[i]) {
          continue;
        }
        // Find the associate point
        var sub_key = "merite_" + $scope.model_char.merite_jeu_6[i].sub_merite;

        if (sub_key in $scope.model_database.point) {
          var dct_key_point = $scope.model_database.point[sub_key];

          for (var key_point in dct_key_point) {
            if (dct_key_point.hasOwnProperty(key_point)) {
              var point_value = dct_key_point[key_point];
              if (key_point in $scope.character_reduce_point) {
                $scope.character_reduce_point[key_point] += point_value;
              } else {
                $scope.character_reduce_point[key_point] = point_value;
              }
            }
          }
        }
      }
    }

    if (isDefined($scope.model_char.merite_jeu_7)) {
      for (var i = 0; i < $scope.model_char.merite_jeu_7.length; i++) {
        if (isUndefined($scope.model_char.merite_jeu_7[i]) || !$scope.model_char.merite_jeu_7[i]) {
          continue;
        }
        // Find the associate point
        var sub_key = "merite_" + $scope.model_char.merite_jeu_7[i].sub_merite;

        if (sub_key in $scope.model_database.point) {
          var dct_key_point = $scope.model_database.point[sub_key];

          for (var key_point in dct_key_point) {
            if (dct_key_point.hasOwnProperty(key_point)) {
              var point_value = dct_key_point[key_point];
              if (key_point in $scope.character_reduce_point) {
                $scope.character_reduce_point[key_point] += point_value;
              } else {
                $scope.character_reduce_point[key_point] = point_value;
              }
            }
          }
        }
      }
    }

    if (isDefined($scope.model_char.merite_jeu_8)) {
      for (var i = 0; i < $scope.model_char.merite_jeu_8.length; i++) {
        if (isUndefined($scope.model_char.merite_jeu_8[i]) || !$scope.model_char.merite_jeu_8[i]) {
          continue;
        }
        // Find the associate point
        var sub_key = "merite_" + $scope.model_char.merite_jeu_8[i].sub_merite;

        // compile merite
        if (sub_key in $scope.model_database.skill_manual) {
          $scope.character_merite.push($scope.model_database.skill_manual[sub_key]);
        }

        if (sub_key in $scope.model_database.point) {
          var dct_key_point = $scope.model_database.point[sub_key];

          for (var key_point in dct_key_point) {
            if (dct_key_point.hasOwnProperty(key_point)) {
              var point_value = dct_key_point[key_point];
              if (key_point in $scope.character_reduce_point) {
                $scope.character_reduce_point[key_point] += point_value;
              } else {
                $scope.character_reduce_point[key_point] = point_value;
              }
            }
          }
        }
      }
    }

    if (isDefined($scope.model_char.esclave)) {
      for (var i = 0; i < $scope.model_char.esclave.length; i++) {
        if (isUndefined($scope.model_char.esclave[i]) || !$scope.model_char.esclave[i]) {
          continue;
        }
        // Find the associate point
        var sub_key = "esclave_" + $scope.model_char.esclave[i].sub_esclave;

        if (sub_key in $scope.model_database.skill_manual) {
          $scope.character_esclave.push($scope.model_database.skill_manual[sub_key]);
        }

        if (sub_key in $scope.model_database.point) {
          var dct_key_point = $scope.model_database.point[sub_key];

          for (var key_point in dct_key_point) {
            if (dct_key_point.hasOwnProperty(key_point)) {
              var point_value = dct_key_point[key_point];
              if (key_point in $scope.character_point) {
                $scope.character_point[key_point] += point_value;
              } else {
                $scope.character_point[key_point] = point_value;
              }
            }
          }
        }
      }
    }

    if (isDefined($scope.model_char.marche)) {
      for (var i = 0; i < $scope.model_char.marche.length; i++) {
        if (isUndefined($scope.model_char.marche[i]) || !$scope.model_char.marche[i]) {
          continue;
        }
        // Find the associate point
        var sub_key = "marche_" + $scope.model_char.marche[i].sub_marche;

        if (sub_key in $scope.model_database.skill_manual) {
          $scope.character_marche.push($scope.model_database.skill_manual[sub_key]);
        }

        if (sub_key in $scope.model_database.point) {
          var dct_key_point = $scope.model_database.point[sub_key];

          for (var key_point in dct_key_point) {
            if (dct_key_point.hasOwnProperty(key_point)) {
              var point_value = dct_key_point[key_point];
              if (key_point in $scope.character_point) {
                $scope.character_point[key_point] += point_value;
              } else {
                $scope.character_point[key_point] = point_value;
              }
            }
          }
        }
      }
    }

    // xp
    var total_xp = 0;
    if ($scope.character_point.hasOwnProperty("PtXp")) {
      $scope.xp_spend = -($scope.character_point["PtXp"]);
    } else {
      $scope.xp_spend = 0;
    }
    total_xp -= $scope.xp_spend;
    $scope.xp_receive = $scope.xp_default;
    if (isDefined($scope.model_user["xp_gn_1"]) && $scope.model_user.xp_gn_1) {
      $scope.xp_receive++;
    }
    if (isDefined($scope.model_user["xp_gn_2"]) && $scope.model_user.xp_gn_2) {
      $scope.xp_receive++;
    }
    if (isDefined($scope.model_user["xp_gn_3"]) && $scope.model_user.xp_gn_3) {
      $scope.xp_receive++;
    }
    if (isDefined($scope.model_user["xp_gn_4"]) && $scope.model_user.xp_gn_4) {
      $scope.xp_receive++;
    }
    if (isDefined($scope.model_user["xp_gn_5"]) && $scope.model_user.xp_gn_5) {
      $scope.xp_receive++;
    }
    if (isDefined($scope.model_user["xp_gn_6"]) && $scope.model_user.xp_gn_6) {
      $scope.xp_receive++;
    }
    if (isDefined($scope.model_user["xp_gn_7"]) && $scope.model_user.xp_gn_7) {
      $scope.xp_receive++;
    }
    if (isDefined($scope.model_user["xp_gn_8"]) && $scope.model_user.xp_gn_8) {
      $scope.xp_receive++;
    }
    total_xp += $scope.xp_receive;
    $scope.xp_total = total_xp;

    // merite
    var total_merite = 0;
    if ($scope.character_point.hasOwnProperty("PtMerite")) {
      $scope.merite_spend = -($scope.character_point["PtMerite"]);
    } else {
      $scope.merite_spend = 0;
    }

    // Remove merite about old game
    var reduce_total_merite = 0;
    if ($scope.character_reduce_point.hasOwnProperty("PtMerite")) {
      reduce_total_merite = -($scope.character_reduce_point["PtMerite"]);
    }

    if ($scope.model_user.hasOwnProperty("total_point_merite")) {
      $scope.merite_receive = $scope.model_user["total_point_merite"];
    } else {
      $scope.merite_receive = 0;
    }
    $scope.merite_receive -= reduce_total_merite;

    total_merite -= $scope.merite_spend;
    total_merite += $scope.merite_receive;
    $scope.merite_total = total_merite;

    $scope.count_sous_ecole = 0;
    if ($scope.model_char.hasOwnProperty("sous_ecole")) {
      for (var i = 0; i < $scope.model_char["sous_ecole"].length; i++) {
        var obj = $scope.model_char["sous_ecole"][i];
        if (obj.hasOwnProperty("sous_ecole")) {
          $scope.count_sous_ecole += 1;
        }
      }
    }
    $scope.capacity_sous_ecole = $scope.get_character_point('PtSousEcoleMagieMax');
    $scope.diff_sous_ecole = $scope.capacity_sous_ecole - $scope.count_sous_ecole;

    // New player
    if ($scope.xp_receive == $scope.xp_default) {
      if (!$scope.character_point.hasOwnProperty("PtPA")) {
        $scope.character_point["PtPA"] = 50;
      } else {
        $scope.character_point["PtPA"] += 50;
      }
      $scope.character_skill.push("Nouveau joueur +50 PA.")
    }

    // Validate count master tech
    if ($scope.count_master_tech > ($scope.xp_receive - $scope.xp_default + 1)) {
      $scope.validated_count_master_tech = false;
    } else {
      $scope.validated_count_master_tech = true;
    }
  }

  $scope.update_point = function () {
    if (isObjEmpty($scope.model_char) && !$scope.is_updated_player) {
      return
    }
    $scope.char_point = {};
    $scope.char_point_ress = {};
    $scope.char_point_attr = {};
    $scope.char_has_ress = false;

    $scope.character_point = {};
    $scope.character_reduce_point = {};
    $scope.character_skill = [];
    $scope.character_merite = [];
    $scope.character_marche = [];
    $scope.character_esclave = [];
    $scope.count_master_tech = 0;

    if (isUndefined($scope.model_database.skill_manual)) {
      return;
    }

    // $scope.update_old_system_point();

    console.debug("mathben")
    // Level 1 - Initialize
    for (const element of $scope.system_point) {
      // Shadow copy object
      let new_element = {...element};

      if (isUndefined(new_element.initial)) {
        new_element.initial = 0;
      }

      new_element["value"] = 0;
      if (element.type == "Attribut") {
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

    // TODO not optimal, move this outside of this function
    // Extract data
    for (const [key, lst_value] of Object.entries($scope.model_char)) {
      if (Array.isArray(lst_value)) {
        // Manage only first level, sub level is manage by hability
        for (const value of lst_value) {
          if (isUndefined(value) || value == null) {
            console.error("Value is undefined for key " + key + ".");
            console.error(lst_value);
          } else if (typeof value == "string" && $scope.model_database.point.hasOwnProperty(value)) {
            for (const [point_name, point_value] of Object.entries($scope.model_database.point[value])) {
              // TODO get new_element
              let new_element = $scope.char_point[point_name];
              $scope._update_attribut(true, value, point_value, new_element);
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
                    $scope._update_attribut(true, new_value, point_value, new_element);
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
                  $scope._update_attribut(true, new_value, point_value, new_element);
                }
              } else {
                console.error("Missing  " + key + " " + new_value);
              }
            }
          } else {
            console.error("Another type");
          }
        }
      }
    }

    // Level 3 - Update values
    for (const [key, new_element] of Object.entries($scope.char_point)) {
      if (new_element.type == "Attribut") {
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
      if (sys_ele.formule) {
        let result = $scope._run_formule(sys_ele.formule, $scope.char_point_attr);
        let new_element = $scope.char_point_attr[sys_ele.name];
        if (isDefined(new_element.max)) {
          result = Math.min(result, new_element.max);
        }
        if (isDefined(new_element.min)) {
          result = Math.max(result, new_element.min);
        }
        new_element["formule_result"] = result;
      }
    }

    // Level 5 - Update status
    // Fill documentation
    for (const [key, lst_value] of Object.entries($scope.model_char)) {
      if (Array.isArray(lst_value)) {
        // Manage only first level, sub level is manage by hability
        for (const value of lst_value) {
          if (isUndefined(value) || value == null) {
            console.error("Value is undefined for key " + key + ".");
            console.error(lst_value);
          } else if (typeof value == "string" && $scope.model_database.point.hasOwnProperty(value)) {
            if (value in $scope.model_database.skill_manual) {
              $scope.character_skill.push($scope.model_database.skill_manual[value]);
            }
          } else if (Array.isArray(value)) {
            console.error("Cannot support array.");
          } else if (typeof value == "object") {
            // Ignore when missing options, the skill is not completed
            if (value.hasOwnProperty("options")) {
              for (const option of value.options) {
                // let new_value = "habilites_" + option;
                let new_value = key + "_" + option;
                if ($scope.model_database.point.hasOwnProperty(new_value)) {
                  if (new_value in $scope.model_database.skill_manual) {
                    $scope.character_skill.push($scope.model_database.skill_manual[new_value]);
                  }
                } else {
                  console.error("Missing habilites " + new_value);
                }
              }
            }
          } else {
            console.error("Another type");
          }
        }
      }
    }

    for (const [key, value] of Object.entries($scope.char_point_ress)) {
      if (value.value > 0) {
        $scope.char_has_ress = true;
        break;
      }
    }

    $scope.get_status_validation();
  };

  $scope._run_formule = function (unique_variable_formule, unique_variable_dct_element) {
    if (unique_variable_formule) {
      for (const [unique_variable_key_ele, unique_variable_var_ele] of Object.entries(unique_variable_dct_element)) {
        eval("window['" + unique_variable_var_ele.name + "'] = " + JSON.stringify(unique_variable_var_ele) + ";");
      }

      let unique_variable_formule_mod = unique_variable_formule.replaceAll(".max", ".max_value");
      return eval(unique_variable_formule_mod);
    }
  };

  $scope._update_attribut = function (result, key, value, element) {
    // result is the value to affect the element, like a boolean
    // value is the transformation
    // element is the cache to update
    var ele_key_name;
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
      if (ele_key_name in element) {
        element[ele_key_name] += value;
      } else {
        element[ele_key_name] = value;
      }
    } else {
      console.error("Type " + typeof result + " is not supported.")
    }
  };

  $scope.$watch("player", function (value) {
    if (!value) {
      $scope.clear_sheet();
      return;
    }
    $scope.prettyPlayer = JSON.stringify(value, undefined, 2);
    // update model information
    $scope.model_user = filterIgnore(value, ["$$hashKey", "character"]);
    // TODO need to find right id character, and not taking first!
    if (isDefined(value.character)) {
      var firstChar = value.character[0];
      $scope.model_char = filterIgnore(firstChar, ["$$hashKey"]);

      if (isDefined($scope.schema_char.properties)) {
        for (const [key, value] of Object.entries($scope.schema_char.properties)) {
          if (value.hasOwnProperty("type")) {
            if (value.type == "array") {
              $scope.model_char[key] = [];
            } else if (value.type == "integer") {
              $scope.model_char[key] = 0;
            }
          }
        }
      }

      $scope.cs_player = $scope.player;
      $scope.cs_setting = "filled";
    } else {
      $scope.clear_sheet();
    }
    $scope.update_point();
    $scope.is_updated_player = true;
    $scope.get_html_qr_code();
  }, true);

  $scope.clear_sheet = function () {
    $scope.model_char = {};

    if (isDefined($scope.schema_char.properties)) {
      for (const [key, value] of Object.entries($scope.schema_char.properties)) {
        if (value.hasOwnProperty("type")) {
          if (value.type == "array") {
            $scope.model_char[key] = [];
          } else if (value.type == "integer") {
            $scope.model_char[key] = 0;
          }
        }
      }
    }

    $scope.cs_player = {};
  }

//get the string to output on the character sheet
  $scope.getSheetOutput = function (value) {
    return isDefined(value) ? value.toString() : "";
  };

  $scope.newPlayer = function () {
    // create empty player with empty character
    $scope.last_player = $scope.player = {};
    $scope.last_character = $scope.character = {};
    $scope.player.character = [$scope.character];

    $scope.setCharacterData(null);
    $scope.new_player = true;
    $scope.no_character = false;
  };

  $scope.newCharacter = function () {
    // create empty player with empty character
    $scope.last_character = $scope.character = {};
    $scope.character.name = "New";
    $scope.player.character.push($scope.character);
    $scope.new_character = true;
    // $scope.player.character. = [$scope.character];
  };

  $scope.moreProductionPt = function () {
    if ($scope.character_point.hasOwnProperty('PtBlocProductionAppliqueAcquis')) {
      return $scope.character_point.PtBlocProductionAppliqueAcquis;
    }
    return 0;
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

  $scope.get_status_validation = function () {
    // need to fix if some negative value
    // xp is preferred to use all point
    // if ($scope.xp_total < 0 || $scope.merite_total < 0 || $scope.diff_sous_ecole < 0 || !$scope.model_char.name || !$scope.model_char.faction || !$scope.validated_count_master_tech) {

    $scope.status_validation = 0;
    $scope.lst_msg_status_validation = []

    // Search validateRequired
    if (isDefined($scope.schema_char.properties)) {
      for (const [key, value] of Object.entries($scope.schema_char.properties)) {
        if (value.hasOwnProperty("validateRequired") && value.validateRequired) {
          if (value.type == "string") {
            if (!$scope.model_char[key]) {
              $scope.status_validation = -1;
              $scope.lst_msg_status_validation.push("Le champs " + key + " doit être rempli.")
            }
          } else {
            console.error(value);
            console.error("Key " + key + " type not supported: " + value.type);
          }
        }
      }
    }

    if ($scope.status_validation != 0) {
      return;
    }

    for (const [key_ele, var_ele] of Object.entries($scope.char_point_attr)) {
      if (var_ele.required) {
        if (var_ele.type == "Attribut") {
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


    // if ($scope.xp_total < 0) {
    //   return -1;
    // } else if ($scope.xp_total > 0 || $scope.diff_sous_ecole > 0) {
    //   return 1;
    // }
    $scope.status_validation = 0;
  };

  $scope.get_karma = function (karma, karmaEsclave) {
    var value = karma - karmaEsclave;
    if (value > 10) {
      return 10;
    }
    return value;
  };

  $scope.modify_password = function (e) {
    // Validate request is not pending
    if ($scope.model_profile.add_password.loading) {
      return;
    }

    // Validate model field
    if ($scope.model_profile.add_password.password == "") {
      $scope.model_profile.status_password.enabled = true;
      $scope.model_profile.status_password.is_error = true;
      $scope.model_profile.status_password.text = "The password is empty.";
    } else if ($scope.model_profile.add_password.password != $scope.model_profile.add_password.check_password) {
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

        if (response.status == -1) {
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

  $scope.get_character_point = function (name) {
    if (!$scope.character_point.hasOwnProperty(name)) {
      return 0;
    }
    return $scope.character_point[name];
  };

  $scope.get_html_qr_code = function () {
    var typeNumber = 5;
    var errorCorrectionLevel = 'L';
    var qr = qrcode(typeNumber, errorCorrectionLevel);
    var data = $window.location.origin + "/character#/?id_player=" + $scope.player.id;
    $scope.url_qr_code = data;
    qr.addData(data);
    qr.make();
    $scope.html_qr_code = qr.createImgTag();
  };

  $scope.is_main = $window.location.hash.substring($window.location.hash.length - 4) == "#!/";
  if ($scope.is_main) {
    $scope.player_id_from_get = "";
  } else {
    // Get id_player, it's suppose to be the last 32 bytes
    $scope.player_id_from_get = $window.location.hash.substr(-32);
    // When no id_player, it's because == #!/
    if ($scope.player_id_from_get == "#!/") {
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
    var data = response.data;
    // special effect, if only one character, select first one
    if ((data.length >= 1 && !$scope.is_admin) || (data.length == 1 && $scope.is_admin)) {
      $scope.player = data[0];
      $scope.character = data[0].character[0];
      $scope.setCharacterData(data[0]);
      $scope.player = data[0];
      $scope.setCharacterData($scope.character);
      // $scope.$apply();
    }
  });
}]);
