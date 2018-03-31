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
