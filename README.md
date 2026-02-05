# linter-eslintx

ESLint v8 linter provider. Lints JavaScript files using project-level `.eslintrc.*` configuration files. Package used linter top-level API to visualize errors and other types of messages with ease.

## Features

- **JavaScript & TypeScript** — activates automatically when JS or TS file is opened
- **Project config** — looks for `.eslintrc.*` files in the project tree (`.eslintrc.js`, `.eslintrc.json`, `.eslintrc.yaml`, etc.)
- **Silent mode** — if no ESLint config is found, the package silently does nothing
- **Bundled ESLint v8** — no global install needed
- **Ignore support** — respects `.eslintignore` files
- **Precise highlighting** — token-level range highlighting for lint messages
- **Auto-fix** — supports fix suggestions from ESLint rules

## Installation

To install `linter-eslintx` search for [linter-eslintx](https://web.pulsar-edit.dev/packages/linter-eslintx) in the Install pane of the Pulsar settings or run `ppm install linter-eslintx`. Alternatively, you can run `ppm install asiloisad/pulsar-linter-eslintx` to install a package directly from the GitHub repository.

## Commands

Commands available in `atom-workspace`:

- `linter-eslintx:reload`: reset the ESLint engine and re-lint open files.

## Contributing

Got ideas to make this package better, found a bug, or want to help add new features? Just drop your thoughts on GitHub — any feedback’s welcome!
