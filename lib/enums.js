'use babel'

export const VCS_STATUS = Object.freeze({
  UNKNOWN: Symbol('unknown status'),
  CLEAN: Symbol('clean status'),
  DELETED: Symbol('deleted status'),
  ADDED: Symbol('added status'),
  MODIFIED: Symbol('modified status')
})

export const BOOK_NODE_TYPE = Object.freeze({
  UNKNOWN: Symbol('unknown node'),
  TITLE: Symbol('title node'),
  HEADING: Symbol('heading node'),
  CHAPTER: Symbol('chapter node')
})
