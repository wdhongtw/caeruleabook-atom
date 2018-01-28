'use babel'

import fs from 'fs'

import Remarkable from 'remarkable'

import { getSummaryPaths } from './utils'

const SUMMARY_ENCODING = 'utf8'

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

  serialize () {
  }

  destroy () {
    this.bookview.remove()
  }

  getBookView () {
    return this.bookview
  }

  updateToc () {
    var tocMd
    const summaryFile = getSummaryPaths()[0]
    if (!fs.existsSync(summaryFile)) {
      return
    }
    try {
      tocMd = fs.readFileSync(summaryFile, SUMMARY_ENCODING)
    } catch (e) {
      console.log('Error', e.stack)
      return
    }
    this.tocMsg.innerHTML = this.mdParser.render(tocMd)
  }
}
