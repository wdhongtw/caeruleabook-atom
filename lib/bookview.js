'use babel'

import fs from 'fs'

import Remarkable from 'remarkable'

import { getSummaryPaths } from './utils'

export default class GitbookView {
  constructor (serializedState) {
    this.mdParser = new Remarkable()
    this.bookview = document.createElement('div')
    this.bookview.classList.add('caeruleabook-view-container')
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
    const bookview = this.bookview
    var tocMd
    if (!fs.existsSync(summaryFile)) {
      console.warn('No SUMMARY file')
      return
    }
    try {
      tocMd = fs.readFileSync(summaryFile, summaryEncoding)
    } catch (err) {
      console.error('Error', err.stack)
      return
    }
    const chapters = getChapters(this.mdParser.render(tocMd))
    const chapterTree = getChapterTree(chapters)
    while (bookview.firstChild) {
      bookview.removeChild(bookview.firstChild)
    }
    bookview.appendChild(chapterTree)
  }
}

class Chapter {
  constructor (name, filePath) {
    this.name = name
    this.filePath = filePath
  }
}

function getChapters (tocHtml) {
  const tocRoot = document.createElement('div')
  const chapters = []

  tocRoot.innerHTML = tocHtml
  const chapterNodeList =
    [...tocRoot.getElementsByTagName('ul')[0].getElementsByTagName('li')]
  chapterNodeList.forEach((liNode) => {
    const aNode = liNode.getElementsByTagName('a')[0]
    const chapter = new Chapter(aNode.innerText, aNode.getAttribute('href'))
    chapters.push(chapter)
  })
  return chapters
}

function getChapterTree (chapters) {
  const chaptersRoot = document.createElement('ul')
  chaptersRoot.classList.add('list-tree')
  chapters.forEach((chapter) => {
    const spanNode = document.createElement('span')
    spanNode.classList.add('icon')
    spanNode.classList.add('icon-file-text')
    spanNode.innerText = chapter.name
    spanNode.onclick = openChapter
    spanNode.setAttribute('filepath', chapter.filePath)
    const liNode = document.createElement('li')
    liNode.classList.add('list-item')
    liNode.appendChild(spanNode)
    chaptersRoot.appendChild(liNode)
  })
  return chaptersRoot
}

function openChapter (mouseEvent) {
  const node = mouseEvent.target
  atom.workspace.open(node.getAttribute('filepath'))
}
