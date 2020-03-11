var fs = require('fs')
var chai = require('chai')
var expect = chai.expect
var Adaptive = require('../')

function readFile (filepath) {
  if (fs.existsSync(filepath)) {
    return fs.readFileSync(filepath, { encoding: 'utf-8' }) || ''
  }
  return ''
}

describe('integration', function () {

  it('normal', function () {
    var fixture = readFile('test/normal/fixture.css')
    var expected = readFile('test/normal/expected.css')
    var adaptiveIns = new Adaptive()
    var output = adaptiveIns.parse(fixture)
    expect(output).is.a.string
    expect(output).eql(expected)
  })

  it('auto px', function () {
    var fixture = readFile('test/autopx/fixture.css')
    var expected = readFile('test/autopx/expected.css')
    var adaptiveIns = new Adaptive({ autoRem: false })
    var output = adaptiveIns.parse(fixture)
    expect(output).is.a.string
    expect(output).eql(expected)
  })

  it('rem prop list', function () {
    var fixture = readFile('test/px-list/fixture.css')
    var expected = readFile('test/px-list/expected.css')
    var adaptiveIns = new Adaptive({
      propList: [ '*', '!border-radius'],
      selectorBlackList: [/^body$/]
    })
    var output = adaptiveIns.parse(fixture)
    expect(output).is.a.string
    expect(output).eql(expected)
  })
})
