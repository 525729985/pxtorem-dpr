"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/* eslint-disable */
exports.default = {
  exact: function exact(list) {
    return list.filter(function (m) {
      return m.match(/^[^\*\!]+$/);
    });
  },
  contain: function contain(list) {
    return list.filter(function (m) {
      return m.match(/^\*.+\*$/);
    }).map(function (m) {
      return m.substr(1, m.length - 2);
    });
  },
  endWith: function endWith(list) {
    return list.filter(function (m) {
      return m.match(/^\*[^\*]+$/);
    }).map(function (m) {
      return m.substr(1);
    });
  },
  startWith: function startWith(list) {
    return list.filter(function (m) {
      return m.match(/^[^\*\!]+\*$/);
    }).map(function (m) {
      return m.substr(0, m.length - 1);
    });
  },
  notExact: function notExact(list) {
    return list.filter(function (m) {
      return m.match(/^\![^\*].*$/);
    }).map(function (m) {
      return m.substr(1);
    });
  },
  notContain: function notContain(list) {
    return list.filter(function (m) {
      return m.match(/^\!\*.+\*$/);
    }).map(function (m) {
      return m.substr(2, m.length - 3);
    });
  },
  notEndWith: function notEndWith(list) {
    return list.filter(function (m) {
      return m.match(/^\!\*[^\*]+$/);
    }).map(function (m) {
      return m.substr(2);
    });
  },
  notStartWith: function notStartWith(list) {
    return list.filter(function (m) {
      return m.match(/^\![^\*]+\*$/);
    }).map(function (m) {
      return m.substr(1, m.length - 2);
    });
  }
  /* eslint-disable */

};