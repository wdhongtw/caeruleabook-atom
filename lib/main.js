'use babel'

import GitbookView from './bookview'
import { getSummaryPaths } from './utils'

const summarySavedEvent = 'caeruleabook.summary.saved'

export default {

  activate () {
    console.info('CaeruleaBook activated!!')
    this.bookView = new GitbookView()

    this.toggleCommand = atom.commands.add(
      'atom-workspace', {
        'caeruleabook:toggle': () => this.toggle()
      }
    )

    this.monitorDisposable =
      atom.workspace.observeTextEditors(checkSummarySave)
    let that = this
    let summaryUpdateHandler = function () {
      that.bookView.updateToc()
    }
    this.summaryChangedDisposable = atom.emitter
      .on(summarySavedEvent, summaryUpdateHandler)
  },

  deactivate () {
    console.info('CaeruleaBook deactivated!!')
    this.toggleCommand.dispose()
    this.monitorDisposable.dispose()
    this.summaryChangedDisposable.dispose()
    this.bookView.destroy()
  },

  serialize () {},

  // Handler functions for custom atom commands
  toggle () {
    console.info('CaeruleaBook toggled!!')
    this.bookView.updateToc()
    this.bookDock = this.bookDock || {
      element: this.bookView.getBookView(),
      getTitle () { return 'Table of Contents' },
      getURI () { return 'atom://caeruleabook/gitbook-view' },
      getDefaultLocation () { return 'left' },
      getAllowedLocations () { return ['left', 'right'] }
    }
    atom.workspace.open(this.bookDock)
  }
}

function checkSummarySave (editor) {
  const currentFile = editor.getPath()
  const summaryPaths = getSummaryPaths()
  if (summaryPaths.indexOf(currentFile) === -1) {
    return
  }
  editor.onDidSave(() => {
    atom.emitter.emit(summarySavedEvent)
  })
}
