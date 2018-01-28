'use babel'

import { CompositeDisposable } from 'atom'

import GitbookView from './gitbook-view'
import { getSummaryPaths } from './utils'

const summarySavedEvent = 'caeruleabook.summary.saved'

export default {
  gitbookView: null,
  subscriptions: null,
  bookDock: null,
  monitorDisposable: null,
  summaryChangedDisposable: null,

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

    this.monitorDisposable =
      atom.workspace.observeTextEditors(this.checkSummarySave)
    let that = this
    let summaryUpdateHandler = function () {
      that.gitbookView.updateToc()
    }
    this.summaryChangedDisposable = atom.emitter
      .on(summarySavedEvent, summaryUpdateHandler)
  },

  deactivate () {
    this.monitorDisposable.dispose()
    this.summaryChangedDisposable.dispose()
    this.subscriptions.dispose()
    this.gitbookView.destroy()
  },

  serialize () {},

  toggle () {
    console.log('CaeruleaBook toggled!!')
    this.gitbookView.updateToc()
    this.bookDock = this.bookDock || {
      element: this.gitbookView.getBookView(),
      getTitle () { return 'Table of Contents' },
      getURI () { return 'atom://caeruleabook/gitbook-view' },
      getDefaultLocation () { return 'left' },
      getAllowedLocations () { return ['left', 'right'] }
    }
    atom.workspace.open(this.bookDock)
  },

  checkSummarySave (editor) {
    const currentFile = editor.getPath()
    const summaryPaths = getSummaryPaths()
    if (summaryPaths.indexOf(currentFile) === -1) {
      return
    }
    editor.onDidSave(() => {
      atom.emitter.emit(summarySavedEvent)
    })
  }
}
