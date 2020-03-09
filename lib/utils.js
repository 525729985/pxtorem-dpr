'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.blacklistedSelector = blacklistedSelector;
exports.createPropListMatcher = createPropListMatcher;

var _filterPropList = require('./lib/filter-prop-list');

var _filterPropList2 = _interopRequireDefault(_filterPropList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function blacklistedSelector(blacklist, selector) {
  if (typeof selector !== 'string') return;
  return blacklist.some(function (regex) {
    if (typeof regex === 'string') return selector.indexOf(regex) !== -1;
    return selector.match(regex);
  });
}

function createPropListMatcher(propList) {
  var hasWild = propList.indexOf('*') > -1;
  var matchAll = hasWild && propList.length === 1;
  var lists = {
    exact: _filterPropList2.default.exact(propList),
    contain: _filterPropList2.default.contain(propList),
    startWith: _filterPropList2.default.startWith(propList),
    endWith: _filterPropList2.default.endWith(propList),
    notExact: _filterPropList2.default.notExact(propList),
    notContain: _filterPropList2.default.notContain(propList),
    notStartWith: _filterPropList2.default.notStartWith(propList),
    notEndWith: _filterPropList2.default.notEndWith(propList)
  };
  return function (prop) {
    if (matchAll) return true;
    return (hasWild || lists.exact.indexOf(prop) > -1 || lists.contain.some(function (m) {
      return prop.indexOf(m) > -1;
    }) || lists.startWith.some(function (m) {
      return prop.indexOf(m) === 0;
    }) || lists.endWith.some(function (m) {
      return prop.indexOf(m) === prop.length - m.length;
    })) && !(lists.notExact.indexOf(prop) > -1 || lists.notContain.some(function (m) {
      return prop.indexOf(m) > -1;
    }) || lists.notStartWith.some(function (m) {
      return prop.indexOf(m) === 0;
    }) || lists.notEndWith.some(function (m) {
      return prop.indexOf(m) === prop.length - m.length;
    }));
  };
}