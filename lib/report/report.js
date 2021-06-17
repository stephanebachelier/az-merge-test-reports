const log = require('debug')('report')

class Node {
  node () {
    throw new Error('Not implemented')
  }

  getChildren () {
    return null
  }

  visit () {
    return [this.node(), this.getChildren()]
  }
}

class $$Report extends Node {
  constructor () {
    super()
    this.suites = []
  }

  addSuites (suites) {
    log('report ~ addSuites %o', suites.file)
    this.suites.push(new $$TestSuites(suites))
  }

  stats () {
    console.log(this.suites.length)
    const stats = {
      tests: 0,
      failures: 0,
      skipped: 0,
      errors: 0,
      time: 0
    }

    return this.suites.reduce((acc, suites) => {
      const { tests, failures, skipped, errors, time } = suites.stats()
      log('suite %s ~> %o : %o', suites.file, { tests, failures, skipped, errors, time })

      return {
        time: acc.time + time,
        tests: acc.tests + tests,
        failures: acc.errors + errors,
        skipped: acc.skipped + skipped,
        errors: acc.failures + failures
      }
    }, stats)
  }

  node () {
    return {
      node: 'testsuites',
      attributes: this.stats()
    }
  }

  getChildren () {
    return this.suites
  }
}

class $$TestSuites extends Node {
  constructor ({ file, suites }) {
    super()
    this.file = file

    const { attributes } = suites

    this.attributes = attributes

    this.time = parseFloat(attributes.time) || 0
    this.tests = parseInt(attributes.tests, 10) || 0
    this.failures = parseInt(attributes.failures, 10) || 0
    this.skipped = parseInt(attributes.skipped, 10) || 0
    this.errors = parseInt(attributes.errors, 10) || 0

    this.suites = suites.suites.map(suite => new $$TestSuite(suite))
  }

  stats () {
    return {
      time: this.time,
      tests: this.tests,
      failures: this.failures,
      skipped: this.skipped,
      errors: this.errors
    }
  }

  node () {
    return {
      node: 'testsuites',
      attributes: {
        ...this.attributes,
        file: this.file
      },
      children: this.getChildren()
    }
  }

  getChildren () {
    return this.suites
  }
}

class $$TestSuite extends Node {
  constructor ({ attributes, cases }) {
    super()
    this.attributes = attributes
    this.cases = cases.map($case => new $$TestCase($case))
  }

  node () {
    return {
      node: 'testsuite',
      attributes: this.attributes,
      children: this.getChildren()
    }
  }

  getChildren () {
    return this.cases
  }
}

class $$TestCase extends Node {
  constructor ({ attributes }) {
    super()
    this.attributes = attributes
  }

  node () {
    return {
      node: 'testcase',
      attributes: this.attributes
    }
  }
}

module.exports = $$Report
