'use babel'

import { VCS_STATUS } from './enums'

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

export function genUniqueId (prefix, length) {
  var id = prefix ? prefix + '-' : ''
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (var idx = 0; idx < length; idx++) {
    id += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return id
}

export function getVcsStatus (repo, status) {
  var vcsStatus
  if (repo.isStatusModified(status)) {
    vcsStatus = VCS_STATUS.MODIFIED
  } else if (repo.isStatusNew(status)) {
    vcsStatus = VCS_STATUS.ADDED
  } else {
    vcsStatus = VCS_STATUS.UNKNOWN
  }
  return vcsStatus
}
