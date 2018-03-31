'use babel'

import GitbookView from './bookview'
import { getSummaryPaths } from './utils'

const summarySavedEvent = 'caeruleabook.summary.saved'

const main = {
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

  // Handler functions for custom atom commands or event listeners
  toggle () {
    console.info('CaeruleaBook toggled!!')
    this.bookView.updateToc()
    this.bookDock = this.bookDock || {
      element: this.bookView.getBookView(),
      getTitle () { return 'Table of Contents' },
      getURI () { return 'atom://caeruleabook/bookdock' },
      getDefaultLocation () { return 'left' },
      getAllowedLocations () { return ['left', 'right'] }
    }
    atom.workspace.toggle(this.bookDock)
  },

  updateToc () {
    this.bookView.updateToc()
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

function summaryUpdateHandler () {
  main.updateToc()
}

export default main
