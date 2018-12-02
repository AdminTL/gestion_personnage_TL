// Formulaire de Traitre-Lame
"use strict";

characterApp.controller("manual_ctrl", ["$scope", "$q", "$http", "$window", "$location", "$timeout", "$anchorScroll", function ($scope, $q, $http, $window, $location, $timeout, $anchorScroll) {
  $scope.manual = null;
  $scope._lst_unique_anchor = [];

  $scope.in_filter_edition = false;
  $scope.filter_list = [];

  $scope.isMobile = function () {
    return $scope.$parent.active_style == 'Petite personne';
  };

  $scope.advance_option = false;

  $scope.formatMenuNavHtml = function (title) {
    return title + " <b class=\"caret\" />";
  };

  $scope.formatAnchor = function (obj, lst_obj_parent) {
    // TODO this function only work in serial process when validate unique anchor name
    if (isUndefined(obj)) {
      return "";
    }
    if (isDefined(obj.titleAnchor)) {
      return obj.titleAnchor;
    }

    function createAnchor(item_1, lst_item) {
      var result = "";
      if (lst_item) {
        for (var i = 0; i < lst_item.length; i++) {
          result += lst_item[i].title.replace(/\s+/g, '') + "_";
        }
      }
      result += item_1.title.replace(/\s+/g, '');
      return result;
    }

    // an anchor cannot work with space
    var anchor = createAnchor(obj, lst_obj_parent);
    obj.titleAnchor = anchor;
    return anchor;
  };

  $scope.getTitleHtml = function (obj) {
    var response;
    if ("title_html" in obj) {
      response = obj["title_html"];
    } else {
      response = obj["title"];
    }
    return response;
  };

  $scope.formatHtmlDescription = function (desc) {
    // todo can use recursivity to simplify html creation
    // format html from string or array
    var response;
    if (Object.prototype.toString.call(desc) === '[object Array]') {
      // each item from string is a paragraph
      response = "";

      var arrayLength = desc.length;
      for (var i = 0; i < arrayLength; i++) {
        var desc_item = desc[i];
        if (typeof desc_item === 'string') {
          response += "<p>" + desc_item + "</p>";
        } else if (Object.prototype.toString.call(desc_item) === '[object Array]') {
          // each array in array is bullet list
          var arrayLength_2 = desc_item.length;
          response += "<ul>";
          for (var j = 0; j < arrayLength_2; j++) {
            var bullet_item = desc_item[j];
            if (Object.prototype.toString.call(bullet_item) === '[object Array]') {
              response += "<ul>";
              // array in bullet is bullet level 2
              var arrayLength_3 = bullet_item.length;
              for (var k = 0; k < arrayLength_3; k++) {
                response += "<li>" + bullet_item[k] + "</li>";
              }
              response += "</ul>";
            } else {
              response += "<li>" + bullet_item + "</li>";
            }
          }
          response += "</ul>";
        } else if (Object.prototype.toString.call(desc_item) === '[object Object]') {
          if (isDefined(desc_item.type)) {
            if (desc_item.type == "image" && isDefined(desc_item.src)) {
              response += "<img src=\"" + desc_item.src + "\" style=\"max-width: 100%; height: auto; display: block;\" class=\"img-responsive img-thumbnail\" alt=\"Responsive image\">";
            }
          }
        }
      }
    } else {
      response = desc;
    }
    return response;
  };

  $scope.select_all = function (is_selected) {
    // prepare data
    for (var i1 = 0; i1 < $scope.manual.length; i1++) {
      var sec1 = $scope.manual[i1];
      sec1.visible = is_selected;
      if (sec1.section) {
        for (var i2 = 0; i2 < sec1.section.length; i2++) {
          var sec2 = sec1.section[i2];
          sec2.visible = is_selected;
          if (sec2.section) {
            for (var i3 = 0; i3 < sec2.section.length; i3++) {
              var sec3 = sec2.section[i3];
              sec3.visible = is_selected;
              if (sec3.section) {
                for (var i4 = 0; i4 < sec3.section.length; i4++) {
                  var sec4 = sec3.section[i4];
                  sec4.visible = is_selected;
                  if (sec4.section) {
                    for (var i5 = 0; i5 < sec4.section.length; i5++) {
                      var sec5 = sec4.section[i5];
                      sec5.visible = is_selected;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  $scope.select_all_filter = function (filter_list) {
    // prepare data
    for (var i1 = 0; i1 < $scope.manual.length; i1++) {
      var sec1 = $scope.manual[i1];
      sec1.visible = filter_list.indexOf($scope.formatAnchor(sec1, null)) >= 0;
      if (sec1.section) {
        for (var i2 = 0; i2 < sec1.section.length; i2++) {
          var sec2 = sec1.section[i2];
          sec2.visible = filter_list.indexOf($scope.formatAnchor(sec2, [sec1])) >= 0;
          if (sec2.section) {
            for (var i3 = 0; i3 < sec2.section.length; i3++) {
              var sec3 = sec2.section[i3];
              sec3.visible = filter_list.indexOf($scope.formatAnchor(sec3, [sec1, sec2])) >= 0;
              if (sec3.section) {
                for (var i4 = 0; i4 < sec3.section.length; i4++) {
                  var sec4 = sec3.section[i4];
                  sec4.visible = filter_list.indexOf($scope.formatAnchor(sec4, [sec1, sec2, sec3])) >= 0;
                  if (sec4.section) {
                    for (var i5 = 0; i5 < sec4.section.length; i5++) {
                      var sec5 = sec4.section[i5];
                      sec5.visible = filter_list.indexOf($scope.formatAnchor(sec5, [sec1, sec2, sec3, sec4])) >= 0;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  $scope.change_location_filter = function () {
    if (!$scope.manual) {
      return "";
    }
    $scope.filter_list = [];

    // detect visible
    for (var i1 = 0; i1 < $scope.manual.length; i1++) {
      var sec1 = $scope.manual[i1];
      if (sec1.visible) {
        $scope.filter_list.push(sec1.titleAnchor);
      }
      if (sec1.section) {
        for (var i2 = 0; i2 < sec1.section.length; i2++) {
          var sec2 = sec1.section[i2];
          if (sec2.visible) {
            $scope.filter_list.push(sec2.titleAnchor);
          }
          if (sec2.section) {
            for (var i3 = 0; i3 < sec2.section.length; i3++) {
              var sec3 = sec2.section[i3];
              if (sec3.visible) {
                $scope.filter_list.push(sec3.titleAnchor);
              }
              if (sec3.section) {
                for (var i4 = 0; i4 < sec3.section.length; i4++) {
                  var sec4 = sec3.section[i4];
                  if (sec4.visible) {
                    $scope.filter_list.push(sec4.titleAnchor);
                  }
                  if (sec4.section) {
                    for (var i5 = 0; i5 < sec4.section.length; i5++) {
                      var sec5 = sec4.section[i5];
                      if (sec5.visible) {
                        $scope.filter_list.push(sec5.titleAnchor);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return $window.location.origin + "/manual#/filter=" + $scope.filter_list.join("&");
  };

  $scope.class_color_level = function (section) {
    // under_level_color is generated from tl_rule.json
    return section.under_level_color;
  };

  $http({
    method: "get",
    url: "/cmd/manual",
    headers: {"Content-Type": "application/json; charset=UTF-8"},
    // data: $httpParamSerializerJQLike(data),
    timeout: 5000
  }).then(function (response/*, status, headers, config*/) {
    $scope.manual = response.data.manual;
    console.info(response.data);

    var key = "/filter=";
    if ($location.path().substring(0, key.length) == key) {
      $scope.filter_list = $location.path().substring(key.length).split("&");
      $scope.select_all_filter($scope.filter_list);
    } else {
      $scope.select_all(true);
    }

    // Need to wait to receive information before move to good position in page
    $timeout(function () {
      var hash = $location.path();
      // remove first "/" of path
      hash = hash.substring(1);
      $anchorScroll(hash);

      // bootstrap_doc_sidebar
      $('body').scrollspy({
        target: '.bs-docs-sidebar',
        offset: 40
      });
      $("#sidebar").affix({
        offset: {
          top: 60
        }
      });

    });

  });


}]);
