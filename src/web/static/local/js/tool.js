'use strict';

/* ############################################################################
 * Generic function
 * ############################################################################
 */
Number.prototype.toHHMMSS = function () {
  var timestamp = "";
  var seconds = Math.floor(this),
    hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;
  var minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;

  if (hours) {
    if (hours < 10) {
      hours = "0" + hours;
    }
    timestamp = hours + 'h';
  }
  if (minutes) {
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    timestamp += minutes + 'm';
  }
  if (timestamp) {
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
  }
  timestamp += seconds + 's';
  return timestamp;
};

function isDefined(x) {
  var undefined;
  return x !== undefined;
}

function GetJsonString(str) {
  var json_parse = null;
  try {
    json_parse = JSON.parse(str);
  } catch (e) {
    console.err("Error parsing json from GetJsonString " + e);
  }
  return json_parse;
}
