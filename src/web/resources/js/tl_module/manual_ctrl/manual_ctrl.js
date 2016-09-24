// Formulaire de Traitre-Lame
"use strict";

characterApp.controller("manual_ctrl", ["$scope", "$q", "$http", "$window", "$location", "$timeout", "$anchorScroll", function ($scope, $q, $http, $window, $location, $timeout, $anchorScroll) {
  $scope.manual = null;
  $scope._lst_unique_anchor = [];

  $scope.isMobile = function () {
    return $scope.$parent.active_style == 'Petite personne';
  };

  $scope.formatMenuNavHtml = function (title) {
    return title + " <b class=\"caret\" />";
  };

  $scope.formatAnchor = function (obj, only_temp=false) {
    // arg only_temp : don't save when ask formatAnchor. Can have a bogue if key is duplicate and this at True, because
    // if we need to give anchor of second creation of key, we will give reference on first one.
    // TODO this function only work in serial process when validate unique anchor name
    if (isUndefined(obj)) {
      return "";
    }
    if (isDefined(obj.titleAnchor)) {
      return obj.titleAnchor;
    }
    var title = obj.title;

    // an anchor cannot work with space
    var anchor = title.replace(/\s+/g, '');
    if (!only_temp) {
      // we don't need to save the information in database
      return anchor;
    }

    var max_loop = 1000;
    // validate duplication
    if (!only_temp && $scope._lst_unique_anchor.includes(anchor)) {
      // find a new name, begin suffix with _2
      var new_anchor;
      for (var i = 2; i < max_loop; i++) {
        new_anchor = anchor + "_" + i;
        if (!(new_anchor in $scope._lst_unique_anchor)) {
          // validate if unique and exit
          break;
        }
      }
      // inform developers about this problem
      if (i >= max_loop) {
        console.error("Manual ctrl - cannot find unique name for anchor " + anchor);
        // don't append empty anchor in $scope._lst_unique_anchor
        anchor = "";
      } else {
        console.warn("Manual ctrl - error duplication anchor name, rename it from " + anchor + " to " + new_anchor);
        obj.titleAnchor = anchor = new_anchor;
        $scope._lst_unique_anchor.push(anchor);
      }
    } else if (!only_temp) {
      $scope._lst_unique_anchor.push(anchor);
      obj.titleAnchor = anchor;
    }
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
        }
      }
    } else {
      response = desc;
    }
    return response;
  };

  $http.get("/cmd/rule").success(
    function (data/*, status, headers, config*/) {
      $scope.manual = data.manual;

      // Need to wait to receive information before move to good position in page
      $timeout(function() {
        var hash = $location.path();
        // remove first "/" of path
        hash = hash.substring(1);
        $anchorScroll(hash);
      });
    }
  );


}]);
