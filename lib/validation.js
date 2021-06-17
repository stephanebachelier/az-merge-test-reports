const fs = require('fs-extra')
const path = require('path')
const get = require('lodash/get')
const log = require('debug')('merger:bin')

const processDir = async (cli, dir) => {
  try {
    log('validating access to dir %s', dir)
    const stats = await fs.stat(dir)

    if (!stats.isDirectory()) {
      console.log(`${dir} is not a directory`)
      return cli.showHelp(2)
    }

    return (await fs.readdir(dir, { withFileTypes: true }))
      .filter(dirent => {
        const extension = dirent.name.substr(-3).toLowerCase()
        log('found file %s with extension %s', dirent.name, extension)
        return dirent.isFile() && extension === 'xml'
      })
      .map(dirent => path.join(dir, dirent.name))
  } catch (e) {
    console.log(`Invalid directory ${dir}`)
    throw e
  }
}

const processFiles = async (cli, files) => {
  try {
    return (
      await Promise.all(
        files.map(async file => {
          log('validating access to file %s', file)

          if (!(await fs.stat(file)).isFile()) {
            log(`Invalid file %s (ignored).`, file)
            return null
          }

          return file
        }))
    ).filter(file => file !== null)
  } catch (e) {
    console.log(`File error ${e.toString()}`)
    throw e
  }
}

module.exports = async cli => {
  const { input, flags } = cli
  const [dir] = input
  let files = []

  const fileLen = get(flags, 'file.length', 0)

  if (!fileLen && !dir) {
    console.log('Either provide a `dir` as argument or multiple `file` options.')
    return cli.showHelp(2)
  }

  if (fileLen && dir) {
    console.log('Choose either a `dir` argument or multiple `file` options.')
    return cli.showHelp(2)
  }

  try {
    files = fileLen > 0 ? await processFiles(cli, flags.file) : await processDir(cli, dir)

    log('Found files %o', files)
  } catch (e) {
    log('Error while serching for existing covertura reports : %s', e)

    return cli.showHelp(2)
  }

  if (!files.length) {
    console.log(`No files found in ${dir}.`)
    process.exit(1)
  }

  return {
    files,
    projectRoot: flags.projectRoot,
    file: flags.report
  }
}
