const log = require('debug')('report')
const $$Report = require('./report')

class TestReport {
  constructor () {
    this.report = new $$Report()
  }

  merge (tree) {
    log('parse suites %o', tree.suites)

    this.report.addSuites(tree.toJson())

    return this
  }

  toJson () {
    return JSON.stringify(this.report, null, 2)
  }

  root () {
    return this.report
  }
}

module.exports = TestReport
