const fs = require('fs')
const os = require('os')
const path = require('path')
const colors = require('colors')
const ini = require('ini')

const getGitConfig = (type = 'global') => {
  let configPath = ''
  const workDir = process.cwd()

  if (type === 'global') {
    configPath = path.join(os.homedir(), '.gitconfig')
  } else {
    configPath = path.resolve(workDir, '.git/config')
  }

  if (!fs.existsSync(configPath)) {
    configPath = path.join(os.homedir(), '.config/git/config')
  }

  console.log(`Using the config: ${configPath.blue}`)
  if (fs.existsSync(configPath)) {
    const file = fs.readFileSync(configPath, 'utf8')
    return ini.parse(file)
  }
  return ''
}

module.exports = {
  getGitConfig
}
