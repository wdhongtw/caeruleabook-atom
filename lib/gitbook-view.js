'use babel'

export default class GitbookView {
  constructor (serializedState) {
    this.bookview = document.createElement('div')
    this.bookview.classList.add('caeruleabook')

    const helloMsg = document.createElement('div')
    helloMsg.textContent = 'Table of Contents goes here'
    helloMsg.classList.add('message')
    this.bookview.appendChild(helloMsg)
  }

  serialize () {
  }

  destroy () {
    this.bookview.remove()
  }

  getBookView () {
    return this.bookview
  }
}
