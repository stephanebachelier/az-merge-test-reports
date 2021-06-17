const XMLWriter = require('./xml-writer')
const path = require('path')
const fs = require('fs-extra')
const log = require('debug')('report:writer')

class CoberturaReport {
  constructor (opts) {
    this.xml = new XMLWriter()

    this.report = opts.report
    this.projectRoot = opts.projectRoot || process.cwd()
    this.file = opts.file || 'test-results.xml'
  }

  toString () {
    return this.xml.toString()
  }

  generate () {
    log('generate XML report')
    const root = this.report.root()

    const report = root.node()

    this.xml.openTag(report.node, report.attributes)

    this.xml.appendNode(root.getChildren())

    this.xml.closeAll()
  }

  async save () {
    const filepath = path.join(this.projectRoot, this.file)

    log('save XML report to %s', filepath)
    const content = this.toString()

    if (!content) {
      throw new Error('Empty XML file. Run generate() first.')
    }

    return fs.writeFile(filepath, content, { encoding: 'utf8' })
  }
}

module.exports = CoberturaReport
