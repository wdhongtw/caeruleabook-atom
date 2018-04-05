'use babel'

import fs from 'fs'
import path from 'path'

export class GitBook {
  constructor (directory, repo) {
    this.directory = directory
    this.projectPath = directory.getPath()
    this.repo = repo
    this.bookAst = null

    this.refresh()
  }

  refresh () {
    // Set default values
    this.bookTitle = path.basename(this.projectPath)
    this.bookRootPath = this.projectPath
    this.summaryFileName = 'SUMMARY.md'
    this.readmeFileName = 'README.md'

    this.config = this.getConfig()
    if (!(this.config)) {
      return
    }

    const config = this.config
    // Override settings if corresponding configs are provided
    if (config.title) {
      this.bookTitle = this.config.title
    }
    if (config.root) {
      this.bookRootPath = path.join(this.projectPath, config.root)
    }
    if (config.structure && config.structure.summary) {
      this.summaryFileName = config.structure.summary
    }
    if (config.structure && config.structure.readme) {
      this.readmeFileName = config.structure.readme
    }
  }

  getConfig () {
    const configPath = path.join(this.projectPath, 'book.json')
    var config = null
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath))
    }
    return config
  }

  isBook () {
    const summaryFilePath = path.join(this.bookRootPath, this.summaryFileName)
    return fs.existsSync(summaryFilePath)
  }
}
