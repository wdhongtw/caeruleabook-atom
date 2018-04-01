'use babel'

import path from 'path'

import { getSummaryFrom, genNode } from './utils'

export default class GitbookView {
  constructor (serializedState) {
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
    const bookview = this.bookview
    const projectList = []
    for (const projectPath of atom.project.getPaths()) {
      const summaryHtml = getSummaryFrom(projectPath)

      const chapters = getChapters(summaryHtml)
      const chapterTree = new ChapterTree(chapters)
      const bookRoot = new BookRoot(atom.project.getPaths()[0])
      const project = new Project(bookRoot, chapterTree)
      projectList.push(project)
    }
    const projects = new Projects(projectList)
    while (bookview.firstChild) {
      bookview.removeChild(bookview.firstChild)
    }
    bookview.appendChild(projects.emt)
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
    tocRoot.getElementsByTagName('ul')[0].getElementsByTagName('li')

  for (const liNode of chapterNodeList) {
    const aNode = liNode.getElementsByTagName('a')[0]
    const chapter = new Chapter(aNode.innerText, aNode.getAttribute('href'))
    chapters.push(chapter)
  }
  return chapters
}

class Projects {
  constructor (projects) {
    const projectsNode =
      genNode('ol', ['list-tree', 'has-collapsable-children'])
    for (const project of projects) {
      projectsNode.appendChild(project.emt)
    }
    this.emt = projectsNode
  }
}

class Project {
  constructor (bookRoot, chapterTree) {
    const projectNode = genNode('li', ['list-nested-item'])
    projectNode.appendChild(bookRoot.emt)
    projectNode.appendChild(chapterTree.emt)
    this.emt = projectNode
  }
}

class BookRoot {
  constructor (projectRoot) {
    const spanNode = genNode('span', ['icon', 'icon-book'])
    spanNode.innerText = path.basename(projectRoot)
    const divNode = genNode('div', ['list-item'])
    divNode.appendChild(spanNode)
    this.emt = divNode
  }
}

class ChapterTree {
  constructor (chapters) {
    const chaptersRoot = genNode('ol', ['list-tree'])
    for (const chapter of chapters) {
      const spanNode = genNode('span', ['icon', 'icon-file-text'])
      spanNode.innerText = chapter.name
      spanNode.onclick = openChapter
      spanNode.setAttribute('filepath', chapter.filePath)
      const liNode = genNode('li', ['list-item'])
      liNode.appendChild(spanNode)
      chaptersRoot.appendChild(liNode)
    }
    this.emt = chaptersRoot
  }
}

function openChapter (mouseEvent) {
  const node = mouseEvent.target
  atom.workspace.open(node.getAttribute('filepath'))
}
