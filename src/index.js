import css from 'css'
import { createPropListMatcher, blacklistedSelector } from './utils'

const PX_REG = /\b(\d+(\.\d+)?)px\b/
const PX_GLOBAL_REG = new RegExp(PX_REG.source, 'g')

export default class Index {
  constructor (options) {
    const defaultConfig = {
      baseDpr: 2,                 // base device pixel ratio (default: 2)
      remUnit: 75,                // rem unit value (default: 75)
      remPrecision: 6,            // rem value precision (default: 6)
      hairlineSelector: '.hairlines', // class name of 1px border (default: '.hairlines')
      autoRem: true,              // whether to transform to rem unit (default: true)
      pxPropList: ['font*', 'border*', '!border-radius'],
      propList: ['*'],
      selectorBlackList: []
    }
    this.config = Object.assign({}, defaultConfig, options)
    this.checkPxProp = createPropListMatcher(this.config.pxPropList)
    this.satisfyPropList = createPropListMatcher(this.config.propList)
  }

  parse (code) {
    const astObj = css.parse(code)
    this._processRules(astObj.stylesheet.rules)
    return css.stringify(astObj)
  }

  _processRules (rules, noDealHairline = false) { // FIXME: keyframes do not support `hairline`
    const { hairlineSelector, autoRem } = this.config
    if (!hairlineSelector) {
      noDealHairline = true
    }
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i]
      const ruleType = rule.type
      if (rule.selectors && blacklistedSelector(this.config.selectorBlackList, rule.selectors.join(' '))) {
        continue
      }
      if (ruleType === 'media' || ruleType === 'supports') {
        this._processRules(rule.rules) // recursive invocation while dealing with media queries
        continue
      }
      else if (ruleType === 'keyframes') {
        this._processRules(rule.keyframes, true) // recursive invocation while dealing with keyframes
        continue
      }
      else if (ruleType !== 'rule' && ruleType !== 'keyframe') {
        continue
      }

      // generate a new rule which has `hairline` class
      let newRule = {}
      if (!noDealHairline) {
        newRule = {
          type: rule.type,
          selectors: rule.selectors.map((sel) => hairlineSelector.split(',').map((selector) => `${selector} ${sel}`)),
          declarations: []
        }
      }

      const declarations = rule.declarations
      for (let j = 0; j < declarations.length; j++) {
        const declaration = declarations[j]
        if (!this.satisfyPropList(declaration.property)) {
          continue
        }
        else if (declaration.type === 'declaration' && PX_REG.test(declaration.value)) {
          const nextDeclaration = declarations[j + 1]
          const originDeclarationValue = declaration.value
          let mode
          if (nextDeclaration && nextDeclaration.type === 'comment') {
            mode = nextDeclaration.comment.trim()
            if (['rem', 'px', 'no'].indexOf(mode) !== -1) {
              if (mode !== 'no') {
                declaration.value = this._getCalcValue(mode, declaration.value)
                declarations.splice(j + 1, 1) // delete corresponding comment
              }
              else {
                declarations.splice(j + 1, 1) // delete corresponding comment
                continue // do not generate `hairline` when there exist `no`
              }
            }
            else {
              mode = autoRem ? 'rem' : 'px'
              declaration.value = this._getCalcValue(mode, declaration.value)
            }
          }
          else {
            mode = autoRem ? 'rem' : 'px'
            if (this.checkPxProp(declaration.property)) {
              mode = 'px'
            }
            declaration.value = this._getCalcValue(mode, declaration.value)
          }

          // generate a new rule of `hairline`
          if (!noDealHairline && /^border(-.*)?(width)?$/.test(declaration.property) && this._needHairline(originDeclarationValue)) {
            const newDeclaration = Object.assign({}, declaration)
            newDeclaration.value = this._getCalcValue('px', originDeclarationValue, true)
            newRule.declarations.push(newDeclaration)
          }
        }
      }

      // add the new rule of `hairline` to stylesheet
      if (!noDealHairline && newRule.declarations.length) {
        rules.splice(i + 1, 0, newRule)
        i++ // skip the newly added rule
      }
    }
  }

  _getCalcValue (type, value, isHairline = false) {
    const { baseDpr, remUnit, remPrecision } = this.config

    function getValue (val, curType = type) {
      val = parseFloat(val.toFixed(remPrecision)) // control decimal precision of the calculated value
      return val === 0 ? val : val + curType
    }

    return value.replace(PX_GLOBAL_REG, ($0, $1) => {
      $1 = Number($1)
      return $1 === 0 ? 0 :
        type === 'rem' && $1 / baseDpr > 0.5 ? getValue($1 / remUnit) :
          !isHairline && $1 / baseDpr < 1 ? getValue($1, 'px') :
            getValue($1 / baseDpr > 0.5 ? $1 / baseDpr : 0.5, 'px')
    })
  }

  _needHairline (value) {
    const { baseDpr } = this.config
    const match = value.match(PX_GLOBAL_REG)

    /* istanbul ignore else */
    if (match) {
      return match.some((pxVal) => {
        const num = pxVal.match(PX_REG)[1] / baseDpr
        return num > 0 && num < 1
      })
    }

    /* istanbul ignore next */
    return false
  }
}
