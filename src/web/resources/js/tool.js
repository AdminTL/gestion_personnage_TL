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

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function (from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

function isDefined(x) {
  return x !== undefined;
}

function isUndefined(x) {
  return x === undefined;
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

function filterIgnore(obj, ignore_key) {
  var result = JSON.parse(JSON.stringify(obj));
  // remove item to ignore
  for (var key in ignore_key)
    delete result[ignore_key[key]];
  return result;
}

// Hash Sha-256 and optional Salt using jsSha
function hashSha256(secret, salt) {
  var shaObj = new jsSHA('SHA-256', 'TEXT');
  if (salt) {
    shaObj.update(salt);
  }
  shaObj.update(secret);
  return shaObj.getHash('HEX');
}

function isArrayEmpty(obj) {
  return obj.length === 0;
}

function isObjEmpty(obj) {
  return Object.keys(obj).length === 0;
}

function ifObjIsObjNotEmpty(obj) {
  if (obj === null) {
    return false;
  }
  if (!(typeof obj === 'object')) {
    return obj != null;
  }
  return !(Object.keys(obj).length === 0);
}

function isBoolean(bool) {
  return typeof bool === 'boolean' ||
    (typeof bool === 'object' &&
      bool !== null &&
      typeof bool.valueOf() === 'boolean');
}

function isNumber(number) {
  return typeof number === 'number';
}

class DefaultDict {
  constructor(defaultInit) {
    return new Proxy({}, {
      get: (target, name) => name in target ?
        target[name] :
        (target[name] = typeof defaultInit === 'function' ?
          new defaultInit().valueOf() :
          defaultInit)
    })
  }
}

if (typeof String.prototype.trim !== 'function') {
  // use like this : str.trim()
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, '');
  }
}