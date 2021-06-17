const parser = require('./parser')
const Report = require('./report')
const CoberturaReport = require('./writer')
const log = require('debug')('merger')

const process = async ({ files, projectRoot, file }) => {
  try {
    const report = new Report()

    log('process files %o', files)
    const result = await files.reduce(async (chain, file) => {
      log('parse test result %s', file)
      report.merge(await parser.parse(file))

      return chain
    }, Promise.resolve([]))
    log('result %o', result)

    const finalReport = new CoberturaReport({
      report,
      projectRoot,
      file
    })

    finalReport.generate()

    await finalReport.save()
  } catch (e) {
    console.log(e)
    console.log(e.stack)
  }
}

module.exports = process
