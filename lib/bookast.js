'use babel'

import path from 'path'

import { genNode, genUniqueId } from './utils'
import {
  CaeruleaError,
  SummarySyntaxError
} from './error'

class BookNode {
  constructor () {
    this.children = []
    this.id = genUniqueId('caeru', 8)
  }

  addChild (childNode) {
    this.children.push(childNode)
  }

  hasChildren () {
    return this.children.length !== 0
  }
}

class TitleNode extends BookNode {
  constructor (title) {
    super()
    this.title = title
  }
}

class HeadingNode extends BookNode {
  constructor (heading) {
    super()
    this.heading = heading
  }
}

class ChapterNode extends BookNode {
  constructor (name, path) {
    super()
    this.name = name
    this.path = path
  }
}

export function toDom (html) {
  const root = document.createElement('body')
  root.innerHTML = html
  return root
}

function checkParts (root) {
  for (const node of root.children) {
    if (['H2', 'H3', 'HR'].includes(node.tagName)) {
      return true
    }
  }
  return false
}

export function toBookAst (root, bookInfo) {
  const hasParts = checkParts(root)

  return hasParts
    ? toBookAstWithParts(root, bookInfo)
    : toBookAstWithoutParts(root, bookInfo)
}

function toBookAstWithParts (root, bookInfo) {
  const headingNodes = []

  for (const node of root.children) {
    if (node.tagName === 'H1') {
      continue
    } else if (['H2', 'H3', 'HR'].includes(node.tagName)) {
      const heading = node.tagName === 'HR' ? 'Untitled Part' : node.innerText
      headingNodes.push(new HeadingNode(heading))
    } else if (node.tagName === 'UL') {
      if (headingNodes.length === 0) {
        throw new SummarySyntaxError('No heading before chapter list')
      } else if (headingNodes[headingNodes.length - 1].hasChildren()) {
        throw new SummarySyntaxError('Multiple chapter list in one part')
      }
      const lastHeadingNode = headingNodes[headingNodes.length - 1]
      for (const liNode of node.children) {
        lastHeadingNode.addChild(toChapterAst(liNode, bookInfo))
      }
    } else {
      throw new SummarySyntaxError('Unhandled tag type: ' + node.tagName)
    }
  }

  const titleNode = new TitleNode(bookInfo.bookName)
  for (const headingNode of headingNodes) {
    titleNode.addChild(headingNode)
  }
  return titleNode
}

function toBookAstWithoutParts (root, bookInfo) {
  const titleNode = new TitleNode(bookInfo.bookName)
  for (const node of root.children) {
    if (node.tagName === 'H1') {
      continue
    } else if (node.tagName === 'UL') {
      for (const liNode of node.children) {
        titleNode.addChild(toChapterAst(liNode, bookInfo))
      }
    } else {
      throw new SummarySyntaxError('Unhandled tag type')
    }
  }
  return titleNode
}

function toChapterAst (liNode, bookInfo) {
  if (liNode.children.length > 2 || liNode.children.length === 0) {
    throw new SummarySyntaxError('Wrong chapter format')
  }
  const aNode = liNode.firstElementChild
  if (aNode.tagName !== 'A') {
    throw new SummarySyntaxError('Chapter not given as link')
  }
  const absFilePath =
    path.join(bookInfo.projectPath, aNode.getAttribute('href'))
  const chapterNode = new ChapterNode(aNode.innerText, absFilePath)
  if (liNode.childElementCount === 2) {
    const ulNode = liNode.lastElementChild
    if (ulNode.tagName !== 'UL') {
      throw new SummarySyntaxError('Chapter format corrupted')
    }
    for (const node of ulNode.children) {
      chapterNode.addChild(toChapterAst(node, bookInfo))
    }
  }
  return chapterNode
}

export function extractFileNodes (root) {
  var files = []
  if (root instanceof ChapterNode) {
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

export function toViewTree (bookNode) {
  const liNode = genNode('li')
  const spanNode = genNode('span', ['icon'], bookNode.id)

  bookNode.liNode = liNode
  bookNode.spanNode = spanNode

  var textContent
  var iconClass
  var isBookTitle = false
  if (bookNode instanceof TitleNode) {
    isBookTitle = true
    textContent = bookNode.title
    iconClass = 'icon-book'
  } else if (bookNode instanceof HeadingNode) {
    textContent = bookNode.heading
    iconClass = 'icon-tag'
  } else if (bookNode instanceof ChapterNode) {
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
      olNode.appendChild(toViewTree(child))
    }
    liNode.appendChild(divNode)
    liNode.appendChild(olNode)
  } else {
    liNode.appendChild(spanNode)
  }

  return liNode
}

export function getTocView (projectTrees) {
  const projectsNode =
    genNode('ol', ['list-tree', 'has-collapsable-children'])
  for (const projectTree of projectTrees) {
    projectsNode.appendChild(projectTree)
  }
  return projectsNode
}
