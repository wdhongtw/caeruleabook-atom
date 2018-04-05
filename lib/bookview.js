'use babel'

import { getSummaryFrom, getVcsStatus } from './utils'
import { VCS_STATUS } from './enums'

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

    for (const book of this.books) {
      const projectPath = book.projectPath
      const repo = book.repo

      const bookInfo = {}
      bookInfo.projectPath = projectPath
      bookInfo.bookName = book.bookTitle
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

        if (repo) {
          const status = repo.getPathStatus(fileNode.path)
          const vcsStatus = getVcsStatus(repo, status)
          this.markVcsStatus(fileNode.path, vcsStatus)
        }
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

  markVcsStatus (filePath, vcsStatus) {
    const file = this.filesByPath[filePath]
    const checkStatus = [VCS_STATUS.ADDED, VCS_STATUS.MODIFIED]
    if (file) {
      file.liNode.classList.remove('status-added')
      file.liNode.classList.remove('status-modified')
    } else {
      return
    }
    if (checkStatus.includes(vcsStatus)) {
      var statusClass
      if (vcsStatus === VCS_STATUS.ADDED) {
        statusClass = 'status-added'
      } else if (vcsStatus === VCS_STATUS.MODIFIED) {
        statusClass = 'status-modified'
      }
      file.liNode.classList.add(statusClass)
    }
  }
}

function openChapter (mouseEvent) {
  const node = mouseEvent.target
  const path = node.getAttribute('data-path')
  atom.workspace.open(path)
}
