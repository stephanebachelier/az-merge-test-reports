const TestCase = require('./testcase')

const assert = require('assert')
/*
{
  "name": "Suite",

  "isSelfClosing": false
}
*/
class TestSuite {
  constructor ({ name, attributes }) {
    assert.ok(name === 'testsuite')

    this.cases = []
    this.attributes = attributes
  }

  addTestCase (tag) {
    const _$case = new TestCase(tag)

    this.cases.push(_$case)

    return _$case
  }

  toJson () {
    return {
      attributes: this.attributes,
      cases: this.cases
    }
  }
}

module.exports = TestSuite
