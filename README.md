# CaeruleaBook - A GitBook extension for Atom editor

This extension is still under development. All existing feature may be
changed in the future.

## Features

* Nested list view of chapters from your `SUMMARY` file
* Open chapters and edit with just one click :D
* Update book view automatically whenever you made change to `SUMMARY`
* Hilight modified and new chapter with respect to current Git HEAD
* Detect book setting from `book.json`, if it exists :D

## Install

This extension can be installed within Atom setting panel.
Just search `caeruleabook`, install and enjoy. :D

You can also install this extension by `apm`:

```
apm install caeruleabook
```

## Usage

Toggle GitBook View by `caeruleabook:toggle` command or navigate through menu:
`Package`, `CaeruleaBook` and `Toggle`.

## Links

- [ToolChain Document](https://toolchain.gitbook.com/)
- [Deprecated Document](https://gitbookio.gitbooks.io/documentation/index.html)

## Planned Features

- GitBook tree view
  - Tree view folding ability
  - Pasive toggle state at editor start up
  - Parse fallback book title from README
  - Refresh book view when add new project
  - Support AsciiDoc
- Create new book (SUMMARY.md, README.md, ...)
- Dialog to add new chapter
- Support Multi-language
- Support Glossary
