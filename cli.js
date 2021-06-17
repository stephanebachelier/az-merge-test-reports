#!/usr/bin/env node
const validation = require('./lib/validation')
const merge = require('./lib')

const cli = require('meow')(`
  Usage

  Provide either a directory where some test reports are present :
  $ azMergeTestReports /path/to/test/results/directory

  Or provide a list of XML test reports using the '-f' option
  $ azMergeTestReports -f /path/to/test/results/1.xml -f /path/to/test/results/2.xml

  Options
  -------
  Provide multiple files:
    --file, -f          a cobertura file report
  Final coverage report:
    --projectRoot, -p   the project root directory to save the generated report (default: current directory)
    --report, -r        the filename of the report (default: test-results.xml)

`, {
  // allowUnknownFlags: false,
  flags: {
    projectRoot: {
      type: 'string',
      alias: 'p'
    },
    report: {
      type: 'string',
      alias: 'r',
      default: 'test-results.xml'
    },
    file: {
      type: 'string',
      alias: 'f',
      isMultiple: true
    }
  }
})

const run = async () => {
  const options = await validation(cli)

  return merge(options)
}

run()
