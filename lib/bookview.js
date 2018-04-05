'use babel'

import { getVcsStatus, genNode } from './utils'
import { VCS_STATUS, BOOK_NODE_TYPE } from './enums'
import { CaeruleaError } from './error'

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
    const bookAsts = []

    for (const book of this.books) {
      book.refresh()
      const repo = book.repo
      const bookAstRoot = book.getBookAst()
      const fileNodes = extractFileNodes(bookAstRoot)
      bookAsts.push(bookAstRoot)

      for (const fileNode of fileNodes) {
        this.files[fileNode.id] = fileNode
        this.filesByPath[fileNode.path] = fileNode
        fileNode.repo = repo
        // We need to mark vcs status after view tree generation
      }
    }

    // Generate ViewTree
    const viewGenerator = new ViewGenerator()
    while (bookview.firstChild) {
      bookview.removeChild(bookview.firstChild)
    }
    bookview.appendChild(viewGenerator.generateView(bookAsts))

    // Register callback function and mark VCS status
    for (const fileId in this.files) {
      const fileNode = this.files[fileId]
      fileNode.spanNode.setAttribute('data-path', fileNode.path)
      fileNode.spanNode.onclick = openChapter

      if (fileNode.repo) {
        const status = fileNode.repo.getPathStatus(fileNode.path)
        const vcsStatus = getVcsStatus(fileNode.repo, status)
        this.markVcsStatus(fileNode.path, vcsStatus)
      }
    }
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

function extractFileNodes (root) {
  var files = []
  if (root.path) { // Consider a node is file iff it has path member
    files.push(root)
  }
  if (root.hasChildren()) {
    for (const child of root.children) {
      const otherFiles = extractFileNodes(child)
      files = files.concat(otherFiles)
    }
  }
  return files
}

class ViewGenerator {
  generateView (bookAsts) {
    const bookViewTrees = []
    for (const bookAst of bookAsts) {
      bookViewTrees.push(this.toViewTree(bookAst))
    }
    return this.getTocView(bookViewTrees)
  }

  toViewTree (bookNode) {
    const liNode = genNode('li')
    const spanNode = genNode('span', ['icon'], bookNode.id)

    bookNode.liNode = liNode
    bookNode.spanNode = spanNode

    var textContent
    var iconClass
    var isBookTitle = false
    if (bookNode.type === BOOK_NODE_TYPE.TITLE) {
      isBookTitle = true
      textContent = bookNode.title
      iconClass = 'icon-book'
    } else if (bookNode.type === BOOK_NODE_TYPE.HEADING) {
      textContent = bookNode.heading
      iconClass = 'icon-tag'
    } else if (bookNode.type === BOOK_NODE_TYPE.CHAPTER) {
      textContent = bookNode.name
      iconClass = 'icon-file-text'
    } else {
      throw new CaeruleaError('Unknown error')
    }
    if (isBookTitle) {
      liNode.classList.add('list-nested-item')
    } else {
      liNode.classList.add('list-item')
    }
    spanNode.classList.add(iconClass)
    spanNode.innerText = textContent

    if (bookNode.hasChildren()) {
      const divNode = genNode('div', ['list-item'])
      divNode.appendChild(spanNode)
      const olNode = genNode('ol', ['list-tree'])
      for (const child of bookNode.children) {
        olNode.appendChild(this.toViewTree(child))
      }
      liNode.appendChild(divNode)
      liNode.appendChild(olNode)
    } else {
      liNode.appendChild(spanNode)
    }

    return liNode
  }

  getTocView (projectTrees) {
    const projectsNode =
    genNode('ol', ['list-tree', 'has-collapsable-children'])
    for (const projectTree of projectTrees) {
      projectsNode.appendChild(projectTree)
    }
    return projectsNode
  }
}
