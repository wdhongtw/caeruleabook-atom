'use babel'

import { CompositeDisposable } from 'atom'

import GitbookView from './bookview'
import { getSummaryPaths, getVcsStatus } from './utils'

const main = {
  activate () {
    console.info('CaeruleaBook activated!!')
    this.bookView = new GitbookView()
    this.repos = {}

    this.toggleCommand = atom.commands.add(
      'atom-workspace', {
        'caeruleabook:toggle': () => this.toggle()
      }
    )

    this.disposables = new CompositeDisposable()
    this.disposables.add(
      atom.workspace.observeActiveTextEditor(markSelectedFile))
    this.monitorDisposable =
      atom.workspace.observeTextEditors(checkSummarySave)

    for (const directory of atom.project.getDirectories()) {
      const repoPromise = atom.project.repositoryForDirectory(directory)
      repoPromise.then((repo) => {
        if (repo) {
          main.repos[directory.getPath()] = repo
          const disposable = repo.onDidChangeStatus((file) => {
            const vcsStatus = getVcsStatus(repo, file.pathStatus)
            main.markVcsStatus(file.path, vcsStatus)
          })
          main.disposables.add(disposable)
        }
      })
    }
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
    this.bookView.repos = this.repos
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
  },

  updateToc () {
    try {
      this.bookView.updateToc()
    } catch (err) {
      console.error(err)
    }
  },

  markSelected (filePath) {
    try {
      this.bookView.markSelected(filePath)
    } catch (err) {
      console.error(err)
    }
  },

  markVcsStatus (filePath, vcsStatus) {
    try {
      this.bookView.markVcsStatus(filePath, vcsStatus)
    } catch (err) {
      console.error(err)
    }
  }
}

function checkSummarySave (editor) {
  const currentFile = editor.getPath()
  const summaryPaths = getSummaryPaths()
  if (summaryPaths.indexOf(currentFile) === -1) {
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
