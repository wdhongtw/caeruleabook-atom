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
      console.warn('No SUMMARY file')
      return
    }
    try {
      tocMd = fs.readFileSync(summaryFile, summaryEncoding)
    } catch (e) {
      console.error('Error', e.stack)
      return
    }
    this.tocMsg.innerHTML = this.mdParser.render(tocMd)
    const chapters = getChapters(this.mdParser.render(tocMd))
    console.info(chapters)
  }
}

class Chapter {
  constructor (name, filePath) {
    this.name = name
    this.filePath = filePath
  }
}

function getChapters (tocHtml) {
  var tocRoot = document.createElement('div')
  var chapters = []

  tocRoot.innerHTML = tocHtml
  const chapterNodeList =
    [...tocRoot.getElementsByTagName('ul')[0].getElementsByTagName('li')]
  chapterNodeList.forEach((liNode) => {
    const aNode = liNode.getElementsByTagName('a')[0]
    const chapter = new Chapter(aNode.innerText, aNode.getAttribute('href'))
    console.info('Chapter', chapter)
    chapters.push(chapter)
  })
  return chapters
}
