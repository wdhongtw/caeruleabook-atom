'use babel'

export class CaeruleaError extends Error {
  constructor (message) {
    super(message)
    this.message = message
  }
}

export class SummarySyntaxError extends CaeruleaError {
  constructor (message) {
    super(message)
    this.message = message
  }
}
