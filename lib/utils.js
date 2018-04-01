'use babel'

import fs from 'fs'
import path from 'path'

import Remarkable from 'remarkable'

export function getSummaryPaths () {
  const summaryPaths = []
  for (const projectPath of atom.project.getPaths()) {
    const summaryPath = getSummaryFileFrom(projectPath)
    if (summaryPath) {
      summaryPaths.push(summaryPath)
    }
  }
  return summaryPaths
}

export function getSummaryFileFrom (projectPath) {
  const summaryFileName = 'SUMMARY.md'
  const summaryPath = path.join(projectPath, summaryFileName)
  if (!fs.existsSync(summaryPath)) {
    console.warn('No SUMMARY file')
    return
  }
  return summaryPath
}

export function getSummaryFrom (projectPath) {
  const summaryPath = getSummaryFileFrom(projectPath)
  const summaryEncoding = 'utf8'
  var summaryMarkdown
  try {
    summaryMarkdown = fs.readFileSync(summaryPath, summaryEncoding)
  } catch (err) {
    console.error('Error', err.stack)
    return
  }
  const mdParser = new Remarkable()
  return mdParser.render(summaryMarkdown)
}

export function genNode (tagName, classes, id) {
  const node = document.createElement(tagName)
  if (classes) {
    for (let cls of classes) {
      if (typeof cls === 'string') {
        node.classList.add(cls)
      }
    }
  }
  if (typeof id === 'string') {
    node.id = id
  }
  return node
}
