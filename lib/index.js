'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _css = require('css');

var _css2 = _interopRequireDefault(_css);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PX_REG = /\b(\d+(\.\d+)?)px\b/;
var PX_GLOBAL_REG = new RegExp(PX_REG.source, 'g');

var Index = function () {
  function Index(options) {
    _classCallCheck(this, Index);

    var defaultConfig = {
      baseDpr: 2, // base device pixel ratio (default: 2)
      remUnit: 75, // rem unit value (default: 75)
      remPrecision: 6, // rem value precision (default: 6)
      hairlineClass: 'hairlines', // class name of 1px border (default: 'hairlines')
      autoRem: true, // whether to transform to rem unit (default: true)
      pxPropList: ['font*', 'border*', '!border-radius'],
      propList: ['*'],
      selectorBlackList: []
    };
    this.config = _extends({}, defaultConfig, options);
    this.checkPxProp = (0, _utils.createPropListMatcher)(this.config.pxPropList);
    this.satisfyPropList = (0, _utils.createPropListMatcher)(this.config.propList);
  }

  _createClass(Index, [{
    key: 'parse',
    value: function parse(code) {
      var astObj = _css2.default.parse(code);
      this._processRules(astObj.stylesheet.rules);
      return _css2.default.stringify(astObj);
    }
  }, {
    key: '_processRules',
    value: function _processRules(rules) {
      var noDealHairline = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      // FIXME: keyframes do not support `hairline`
      var _config = this.config,
          hairlineClass = _config.hairlineClass,
          autoRem = _config.autoRem;


      for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        var ruleType = rule.type;
        if (rule.selectors && (0, _utils.blacklistedSelector)(this.config.selectorBlackList, rule.selectors.join(' '))) {
          continue;
        }
        if (ruleType === 'media' || ruleType === 'supports') {
          this._processRules(rule.rules); // recursive invocation while dealing with media queries
          continue;
        } else if (ruleType === 'keyframes') {
          this._processRules(rule.keyframes, true); // recursive invocation while dealing with keyframes
          continue;
        } else if (ruleType !== 'rule' && ruleType !== 'keyframe') {
          continue;
        }

        // generate a new rule which has `hairline` class
        var newRule = {};
        if (!noDealHairline) {
          newRule = {
            type: rule.type,
            selectors: rule.selectors.map(function (sel) {
              return '.' + hairlineClass + ' ' + sel;
            }),
            declarations: []
          };
        }

        var declarations = rule.declarations;
        for (var j = 0; j < declarations.length; j++) {
          var declaration = declarations[j];
          if (!this.satisfyPropList(declaration.property)) {
            continue;
          } else if (declaration.type === 'declaration' && PX_REG.test(declaration.value)) {
            var nextDeclaration = declarations[j + 1];
            var originDeclarationValue = declaration.value;
            var mode = void 0;
            if (nextDeclaration && nextDeclaration.type === 'comment') {
              mode = nextDeclaration.comment.trim();
              if (['rem', 'px', 'no'].indexOf(mode) !== -1) {
                if (mode !== 'no') {
                  declaration.value = this._getCalcValue(mode, declaration.value);
                  declarations.splice(j + 1, 1); // delete corresponding comment
                } else {
                  declarations.splice(j + 1, 1); // delete corresponding comment
                  continue; // do not generate `hairline` when there exist `no`
                }
              } else {
                mode = autoRem ? 'rem' : 'px';
                declaration.value = this._getCalcValue(mode, declaration.value);
              }
            } else {
              mode = autoRem ? 'rem' : 'px';
              if (this.checkPxProp(declaration.property)) {
                mode = 'px';
              }
              declaration.value = this._getCalcValue(mode, declaration.value);
            }

            // generate a new rule of `hairline`
            if (!noDealHairline && this._needHairline(originDeclarationValue)) {
              var newDeclaration = _extends({}, declaration);
              newDeclaration.value = this._getCalcValue('px', originDeclarationValue, true);
              newRule.declarations.push(newDeclaration);
            }
          }
        }

        // add the new rule of `hairline` to stylesheet
        if (!noDealHairline && newRule.declarations.length) {
          rules.splice(i + 1, 0, newRule);
          i++; // skip the newly added rule
        }
      }
    }
  }, {
    key: '_getCalcValue',
    value: function _getCalcValue(type, value) {
      var isHairline = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var _config2 = this.config,
          baseDpr = _config2.baseDpr,
          remUnit = _config2.remUnit,
          remPrecision = _config2.remPrecision;


      function getValue(val) {
        var curType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : type;

        val = parseFloat(val.toFixed(remPrecision)); // control decimal precision of the calculated value
        return val === 0 ? val : val + curType;
      }

      return value.replace(PX_GLOBAL_REG, function ($0, $1) {
        $1 = Number($1);
        return $1 === 0 ? 0 : type === 'rem' && $1 / baseDpr > 0.5 ? getValue($1 / remUnit) : !isHairline && $1 / baseDpr < 1 ? getValue($1, 'px') : getValue($1 / baseDpr > 0.5 ? $1 / baseDpr : 0.5, 'px');
      });
    }
  }, {
    key: '_needHairline',
    value: function _needHairline(value) {
      var baseDpr = this.config.baseDpr;

      var match = value.match(PX_GLOBAL_REG);

      /* istanbul ignore else */
      if (match) {
        return match.some(function (pxVal) {
          var num = pxVal.match(PX_REG)[1] / baseDpr;
          return num > 0 && num < 1;
        });
      }

      /* istanbul ignore next */
      return false;
    }
  }]);

  return Index;
}();

exports.default = Index;