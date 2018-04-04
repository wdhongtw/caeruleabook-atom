'use babel'

import path from 'path'

import { getSummaryFrom } from './utils'

import {
  toDom,
  toBookAst,
  toViewTree,
  getTocView,
  extractFileNodes
} from './bookast'

export default class GitbookView {
  constructor (serializedState) {
    this.bookview = document.createElement('div')
    this.bookview.classList.add('caeruleabook-view-container')
    this.files = {}
    this.filesByPath = {}
  }

  destroy () {
    this.bookview.remove()
  }

  getBookView () {
    return this.bookview
  }

  updateToc () {
    const bookview = this.bookview
    const viewTrees = []
    for (const projectPath of atom.project.getPaths()) {
      const bookInfo = {}
      bookInfo.projectPath = projectPath
      bookInfo.bookName = path.basename(projectPath)
      const summaryHtml = getSummaryFrom(projectPath)

      const domRoot = toDom(summaryHtml)
      const bookAstRoot = toBookAst(domRoot, bookInfo)
      const fileNodes = extractFileNodes(bookAstRoot)
      const bookViewRoot = toViewTree(bookAstRoot)
      for (const fileNode of fileNodes) {
        this.files[fileNode.id] = fileNode
        this.filesByPath[fileNode.path] = fileNode
        fileNode.spanNode.setAttribute('data-path', fileNode.path)
        fileNode.spanNode.onclick = openChapter
      }
      viewTrees.push(bookViewRoot)
    }
    while (bookview.firstChild) {
      bookview.removeChild(bookview.firstChild)
    }
    bookview.appendChild(getTocView(viewTrees))
  }

  markSelected (filePath) {
    if (this.lastSelectedFile) {
      this.lastSelectedFile.liNode.classList.remove('selected')
    }
    if (filePath) {
      if (this.filesByPath[filePath]) {
        const file = this.filesByPath[filePath]
        file.liNode.classList.add('selected')
        this.lastSelectedFile = file
      }
    }
  }
}

function openChapter (mouseEvent) {
  const node = mouseEvent.target
  const path = node.getAttribute('data-path')
  atom.workspace.open(path)
}
