'use babel'

import GitbookView from './gitbook-view.js'
import { CompositeDisposable } from 'atom'

export default {
  gitbookView: null,
  subscriptions: null,
  bookDock: null,

  activate () {
    console.log('CaeruleaBook activated!!')
    this.gitbookView = new GitbookView()

    this.subscriptions = new CompositeDisposable()
    const toggleCommand = atom.commands.add(
      'atom-workspace', {
        'caeruleabook:toggle': () => this.toggle()
      }
    )
    this.subscriptions.add(toggleCommand)
  },

  deactivate () {
    this.subscriptions.dispose()
    this.gitbookView.destroy()
  },

  serialize () {},

  toggle () {
    console.log('CaeruleaBook toggled!!')
    this.bookDock = this.bookDock || {
      element: this.gitbookView.getBookView(),
      getTitle () { return 'Table of Contents' },
      getURI () { return 'atom://caeruleabook/gitbook-view' },
      getDefaultLocation () { return 'left' },
      getAllowedLocations () { return ['left', 'right'] }
    }
    atom.workspace.open(this.bookDock)
  }
}
