'use babel'

import fs from 'fs'
import path from 'path'

import Remarkable from 'remarkable'

import { genUniqueId } from './utils'
import { SummarySyntaxError } from './error'
import { BOOK_NODE_TYPE } from './enums'

export class GitBook {
  constructor (directory, repo) {
    this.directory = directory
    this.projectPath = directory.getPath()
    this.repo = repo

    this.refresh()
  }

  refresh () {
    this.summaryDom = null
    this.bookAst = null
    // Set default values
    this.bookTitle = path.basename(this.projectPath)
    this.bookRootPath = this.projectPath
    this.summaryFileName = 'SUMMARY.md'
    this.readmeFileName = 'README.md'
    this.summaryFilePath = path.join(this.bookRootPath, this.summaryFileName)

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
      this.summaryFilePath = path.join(this.bookRootPath, this.summaryFileName)
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
    return fs.existsSync(this.summaryFilePath)
  }

  getSummaryHtml () {
    var summaryMarkdown
    try {
      summaryMarkdown = fs.readFileSync(this.summaryFilePath, 'utf8')
    } catch (err) {
      console.error('Error', err.stack)
      return
    }
    const mdParser = new Remarkable()
    return mdParser.render(summaryMarkdown)
  }

  getSummaryDom () {
    if (this.summaryDom) {
      return this.summaryDom
    }
    const summaryHtml = this.getSummaryHtml()
    this.summaryDom = document.createElement('body')
    this.summaryDom.innerHTML = summaryHtml
    return this.summaryDom
  }

  checkParts (root) {
    for (const node of root.children) {
      if (['H2', 'H3', 'HR'].includes(node.tagName)) {
        return true
      }
    }
    return false
  }

  getBookAst () {
    if (this.bookAst) {
      return this.bookAst
    }
    const domRoot = this.getSummaryDom()
    const hasParts = this.checkParts(domRoot)
    this.bookAst = hasParts
      ? this.getBookAstWithParts(domRoot)
      : this.getBookAstWithoutParts(domRoot)
    return this.bookAst
  }

  getBookAstWithParts (root) {
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
          lastHeadingNode.addChild(this.toChapterAst(liNode))
        }
      } else {
        throw new SummarySyntaxError('Unhandled tag type: ' + node.tagName)
      }
    }

    const titleNode = new TitleNode(this.bookTitle, this.summaryFilePath)
    for (const headingNode of headingNodes) {
      titleNode.addChild(headingNode)
    }
    return titleNode
  }

  getBookAstWithoutParts (root) {
    const titleNode = new TitleNode(this.bookTitle, this.summaryFilePath)
    for (const node of root.children) {
      if (node.tagName === 'H1') {
        continue
      } else if (node.tagName === 'UL') {
        for (const liNode of node.children) {
          titleNode.addChild(this.toChapterAst(liNode))
        }
      } else {
        throw new SummarySyntaxError('Unhandled tag type')
      }
    }
    return titleNode
  }

  toChapterAst (liNode) {
    if (liNode.children.length > 2 || liNode.children.length === 0) {
      throw new SummarySyntaxError('Wrong chapter format')
    }
    const aNode = liNode.firstElementChild
    if (aNode.tagName !== 'A') {
      throw new SummarySyntaxError('Chapter not given as link')
    }
    const absFilePath =
    path.join(this.bookRootPath, aNode.getAttribute('href'))
    const chapterNode = new ChapterNode(aNode.innerText, absFilePath)
    if (liNode.childElementCount === 2) {
      const ulNode = liNode.lastElementChild
      if (ulNode.tagName !== 'UL') {
        throw new SummarySyntaxError('Chapter format corrupted')
      }
      for (const node of ulNode.children) {
        chapterNode.addChild(this.toChapterAst(node))
      }
    }
    return chapterNode
  }
}

class BookNode {
  constructor () {
    this.children = []
    this.id = genUniqueId('caeru', 8)
    this.type = BOOK_NODE_TYPE.UNKNOWN
  }

  addChild (childNode) {
    this.children.push(childNode)
  }

  hasChildren () {
    return this.children.length !== 0
  }
}

class FileNode extends BookNode {
  constructor (path) {
    super()
    this.path = path
  }
}

class TitleNode extends FileNode {
  constructor (title, path) {
    super(path)
    this.title = title
    this.type = BOOK_NODE_TYPE.TITLE
  }
}

class HeadingNode extends BookNode {
  constructor (heading) {
    super()
    this.heading = heading
    this.type = BOOK_NODE_TYPE.HEADING
  }
}

class ChapterNode extends FileNode {
  constructor (name, path) {
    super(path)
    this.name = name
    this.type = BOOK_NODE_TYPE.CHAPTER
  }
}
