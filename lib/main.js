'use babel'

import { CompositeDisposable } from 'atom'

import GitbookView from './bookview'
import { getVcsStatus } from './utils'
import { GitBook } from './book'

const main = {
  async activate () {
    console.info('CaeruleaBook activated!!')
    this.books = []
    this.summaryPaths = []
    this.bookView = new GitbookView()
    this.bookView.books = this.books

    this.toggleCommand = atom.commands.add(
      'atom-workspace', {
        'caeruleabook:toggle': () => this.toggle()
      }
    )

    this.disposables = new CompositeDisposable()
    this.disposables.add(
      atom.workspace.observeActiveTextEditor(markSelectedFile))

    for (const directory of atom.project.getDirectories()) {
      const repository = await atom.project.repositoryForDirectory(directory)
      if (repository) {
        const disposable = repository.onDidChangeStatus((file) => {
          const vcsStatus = getVcsStatus(repository, file.pathStatus)
          main.markVcsStatus(file.path, vcsStatus)
        })
        main.disposables.add(disposable)
      }
      const book = new GitBook(directory, repository)
      this.books.push(book)
      this.summaryPaths.push(book.summaryFilePath)
    }

    // should wait summaryPaths object ready to register callback function
    this.monitorDisposable =
      atom.workspace.observeTextEditors(checkSummarySave)
  },

  deactivate () {
    console.info('CaeruleaBook deactivated!!')
    this.disposables.dispose()
    this.toggleCommand.dispose()
    this.monitorDisposable.dispose()
    this.bookView.destroy()
  },

  serialize () {},

  // Handler functions for custom atom commands or event listeners
  toggle () {
    console.info('CaeruleaBook toggled!!')
    try {
      this.bookView.updateToc()
      this.bookDock = this.bookDock || {
        element: this.bookView.getBookView(),
        getTitle () { return 'Table of Contents' },
        getURI () { return 'atom://caeruleabook/bookdock' },
        getDefaultLocation () { return 'left' },
        getAllowedLocations () { return ['left', 'right'] }
      }
      markSelectedFile(atom.workspace.getActiveTextEditor())
      atom.workspace.toggle(this.bookDock)
    } catch (err) {
      this.notifyPackageError(err)
    }
  },

  updateToc () {
    try {
      this.bookView.updateToc()
    } catch (err) {
      this.notifyPackageError(err)
    }
  },

  markSelected (filePath) {
    try {
      this.bookView.markSelected(filePath)
    } catch (err) {
      this.notifyPackageError(err)
    }
  },

  markVcsStatus (filePath, vcsStatus) {
    try {
      this.bookView.markVcsStatus(filePath, vcsStatus)
    } catch (err) {
      this.notifyPackageError(err)
    }
  },

  notifyPackageError (err) {
    console.error(err)
    var message
    if ((err instanceof Error) && err.message !== '') {
      message = err.message
    } else {
      message = 'Unknown Error, so sorry :('
    }
    const options = { detail: message }
    atom.notifications.addWarning('CaeruleaBook Operation Fail:', options)
  }
}

function checkSummarySave (editor) {
  const currentFile = editor.getPath()
  if (main.summaryPaths.indexOf(currentFile) === -1) {
    return
  }
  editor.onDidSave(() => {
    main.updateToc()
  })
}

function markSelectedFile (editor) {
  const activeFile = editor ? editor.getPath() : null
  main.markSelected(activeFile)
}

export default main
