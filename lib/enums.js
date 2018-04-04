'use babel'

export const VCS_STATUS = Object.freeze({
  UNKNOWN: Symbol('unknown status'),
  CLEAN: Symbol('clean status'),
  DELETED: Symbol('deleted status'),
  ADDED: Symbol('added status'),
  MODIFIED: Symbol('modified status')
})
