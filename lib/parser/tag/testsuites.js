const TestSuite = require('./testsuite')

const assert = require('assert')
/*
{
  "name": "Suite",

  "isSelfClosing": false
}
*/
class TestSuites {
  constructor ({ name, attributes }) {
    assert.ok(name === 'testsuites')

    this.suites = []
    this.attributes = attributes

    this.file = null
  }

  set file (file) {
    this._file = file
  }

  addTestSuite (tag) {
    this._$suite = new TestSuite(tag)

    this.suites.push(this._$suite)

    return this._$suite
  }

  addTestCase (tag) {
    return this._$suite.addTestCase(tag)
  }

  closeTestSuite () {
    this._$suite = null
  }

  toJson () {
    return {
      file: this._file,
      attributes: this.attributes,
      suites: this.suites
    }
  }
}

TestSuites.map = {
  testsuites: TestSuites,
  testsuite: TestSuites.addTestSuite,
  testcase: TestSuites.addTestCase
}

module.exports = TestSuites
