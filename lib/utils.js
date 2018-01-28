'use babel'

import path from 'path'

const SUMMARY_FILENAME = 'SUMMARY.md'

export function getSummaryPaths () {
  const projectRoots = atom.project.getPaths()
  const summaryPaths = []
  for (let root of projectRoots) {
    summaryPaths.push(path.join(root, SUMMARY_FILENAME))
  }
  return summaryPaths
}
