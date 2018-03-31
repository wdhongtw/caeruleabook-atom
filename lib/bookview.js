'use babel'

import fs from 'fs'

import Remarkable from 'remarkable'

import { getSummaryPaths } from './utils'

export default class GitbookView {
  constructor (serializedState) {
    this.mdParser = new Remarkable()
    this.bookview = document.createElement('div')
    this.bookview.classList.add('caeruleabook')

    this.tocMsg = document.createElement('div')
    this.tocMsg.innerHTML = 'Table of Contents goes here'
    this.tocMsg.classList.add('message')
    this.bookview.appendChild(this.tocMsg)
  }

  destroy () {
    this.bookview.remove()
  }

  getBookView () {
    return this.bookview
  }

  updateToc () {
    const summaryEncoding = 'utf8'
    const summaryFile = getSummaryPaths()[0]
    var tocMd
    if (!fs.existsSync(summaryFile)) {
      return
    }
    try {
      tocMd = fs.readFileSync(summaryFile, summaryEncoding)
    } catch (e) {
      console.error('Error', e.stack)
      return
    }
    this.tocMsg.innerHTML = this.mdParser.render(tocMd)
  }
}
