"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
// excluding regex trick: http://www.rexegg.com/regex-best-trick.html

// Not anything inside double quotes
// Not anything inside single quotes
// Not anything inside url()
// Any digit followed by px
// !singlequotes|!doublequotes|!url()|pixelunit
/* eslint-disable */
exports.default = /"[^"]+"|'[^']+'|url\([^\)]+\)|(\d*\.?\d+)px/g;
/* eslint-disable */