# pxtorem-dpr

A [postcss](https://www.npmjs.com/package/postcss) plugin that calculates and generates adaptive css code, such as `rem` and `0.5px borders for retina devices`.

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Downloads][downloads-image]][downloads-url]

## Table of Contents

* [Requirements](#requirements)
* [Usage](#usage)
* [Changelog](#changelog)
* [License](#license)

## Requirements

Set rem unit and hairline class. For example:

```javascript
(function (win, doc) {
  var docEl = doc.documentElement;

  function setRemUnit () {
    var docWidth = docEl.clientWidth;
    var rem = docWidth / 10;
    docEl.style.fontSize = rem + 'px';
  }

  win.addEventListener('resize', function () {
    setRemUnit();
  }, false);
  win.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      setRemUnit();
    }
  }, false);

  setRemUnit();

  if (win.devicePixelRatio && win.devicePixelRatio >= 2) {
    var testEl = doc.createElement('div');
    var fakeBody = doc.createElement('body');
    testEl.style.border = '0.5px solid transparent';
    fakeBody.appendChild(testEl);
    docEl.appendChild(fakeBody);
    if (testEl.offsetHeight === 1) {
      docEl.classList.add('hairlines');
    }
    docEl.removeChild(fakeBody);
  }
}) (window, document);
```
Or use [amfe-flexible](https://github.com/amfe/lib-flexible)

## Usage

The raw stylesheet only contains @2x style, and if you

* intend to use `rem` unit，add `/*rem*/` after the declaration
* don't intend to transform the original value, add `/*no*/` after the declaration
* intend to use `px` unit when `autoRem` is set to `true`, add `/*px*/` after the declaration

**Attention: Dealing with SASS or LESS, only `/*...*/` comment can be used, in order to have the comments persisted.**

Before processing:

```css
.selector {
  height: 64px;
  width: 150px; /*rem*/
  padding: 10px; /*no*/
  border-top: 1px solid #ddd;
}
```

After processing:

```css
.selector {
  height: 32px;
  width: 2rem;
  padding: 10px;
  border-top: 1px solid #ddd;
}
.hairlines .selector {
  border-top: 0.5px solid #ddd;
}
```

### API

`adaptive(config)`

Config: 

* `remUnit`: number, rem unit value (default: 75)
* `baseDpr`: number, base device pixel ratio (default: 2)
* `remPrecision`: number, rem value precision (default: 6)
* `hairlineClass`: string, class name of 1px border (default 'hairlines')
* `autoRem`: boolean, whether to transform to rem unit (default: true)
* `propList`: array, The properties that can use transform (default: ['*'])
  - Values need to be exact matches.
  - Use wildcard * to enable all properties. Example: ['*']
  - Use * at the start or end of a word. (['*position*'] will match background-position-y)
  - Use ! to not match a property. Example: ['*', '!letter-spacing']
  - Combine the "not" prefix with the other prefixes. Example: ['*', '!font*']
* `pxPropList`: array, The properties that can change from px to dpr (default: ['font*', 'border*', '!border-radius'])
  - Values need to be exact matches.
   - Use wildcard * to enable all properties. Example: ['*']
   - Use * at the start or end of a word. (['*position*'] will match background-position-y)
   - Use ! to not match a property. Example: ['*', '!letter-spacing']
   - Combine the "not" prefix with the other prefixes. Example: ['*', '!font*']

* `selectorBlackList`:  array, The selectors to ignore and leave as px. (default: [])
  -  If value is string, it checks to see if selector contains the string.
      -  ['body'] will match .body-class
  -  If value is regexp, it checks to see if the selector matches the regexp.
      -  [/^body$/] will match body but not .body

* `exclude`: array, The selectors to ignore file. (default: null)
  - If value is string, it checks to see if selector contains the string. Example: ['node_modules']
  - If value is regexp, it checks to see if the selector matches the regexp.

## License

MIT
