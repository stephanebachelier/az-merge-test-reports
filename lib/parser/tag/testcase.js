const assert = require('assert')

class TestCase {
  constructor ({ name, attributes }) {
    assert.ok(name === 'testcase')

    this.attributes = attributes
  }

  toJson () {
    return {
      attributes: this.attributes
    }
  }
}

module.exports = TestCase
