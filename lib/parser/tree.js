const TestSuites = require('./tag/testsuites')

class Tree {
  constructor (file) {
    this.suites = null
    this.file = file
  }

  addTag (tag) {
    switch (tag.name) {
      case 'testsuites': {
        this.suites = new TestSuites(tag)
        this.suites.file = this.file
        break
      }

      case 'testsuite': {
        this.suites.addTestSuite(tag)
        break
      }

      case 'testcase': {
        this.suites.addTestCase(tag)
        break
      }

      default:
        return null
    }
  }

  closeTag (tag) {
    switch (tag.name) {
      case 'testsuite': {
        this.suites.closeTestSuite()
        break
      }

      default:
        return null
    }
  }

  toJson () {
    return {
      file: this.file,
      suites: this.suites
    }
  }
}

module.exports = Tree
