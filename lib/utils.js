'use babel'

import path from 'path'

export function getSummaryPaths () {
  const summaryFilename = 'SUMMARY.md'
  const projectRoots = atom.project.getPaths()
  const summaryPaths = []
  for (let root of projectRoots) {
    summaryPaths.push(path.join(root, summaryFilename))
  }
  return summaryPaths
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
